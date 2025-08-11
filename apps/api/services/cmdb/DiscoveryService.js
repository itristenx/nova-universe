import { logger } from '../../logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
// import ping from 'ping'; // Optional: enable 'ping' package for real ICMP checks

async function getCmdbPrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../../prisma/generated/cmdb/index.js');
    return new mod.PrismaClient();
  } catch { return null; }
}

// Initialize Prisma client for CMDB
const clientPromise = getCmdbPrisma();

export class DiscoveryService {
  constructor() {
    this.client = clientPromise;
  }

  /**
   * Start a discovery run
   */
  async startDiscoveryRun(config) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const discoveryRun = await client.discoveryRun.create({
        data: { scheduleId: config.scheduleId, status: 'Running', startTime: new Date(), itemsDiscovered: 0, itemsUpdated: 0, itemsCreated: 0 }
      });
      this._executeDiscovery(discoveryRun.id, config).catch(error => {
        logger.error('Discovery run failed:', error);
        this._updateDiscoveryRunStatus(discoveryRun.id, 'Failed', { error: error.message });
      });
      logger.info(`Discovery run started: ${discoveryRun.id} (${config.discoveryType})`);
      return discoveryRun;
    } catch (error) {
      logger.error('Error starting discovery run:', error);
      throw new Error('Failed to start discovery run');
    }
  }

  /**
   * Get discovery run history
   */
  async getDiscoveryRuns(limit = 50) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      return await client.discoveryRun.findMany({
        orderBy: { startTime: 'desc' },
        take: limit,
        include: { discoveredItems: { take: 5, orderBy: { discoveredAt: 'desc' } } }
      });
    } catch (error) {
      logger.error('Error fetching discovery runs:', error);
      throw new Error('Failed to fetch discovery runs');
    }
  }

  /**
   * Get discovered items for processing
   */
  async getDiscoveredItems(runId, status = 'New') {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      return await client.discoveredItem.findMany({ where: { runId, status }, orderBy: { discoveredAt: 'asc' } });
    } catch (error) {
      logger.error('Error fetching discovered items:', error);
      throw new Error('Failed to fetch discovered items');
    }
  }

  /**
   * Process discovered item into CI
   */
  async processDiscoveredItem(itemId, processingOptions = {}) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const item = await client.discoveredItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error('Discovered item not found');
      const discoveredData = item.discoveredData;
      let ci = null;
      const existingCi = await this._findExistingCi(discoveredData);
      if (existingCi) {
        ci = await this._updateExistingCi(existingCi, discoveredData);
        await this._updateDiscoveredItemStatus(itemId, 'Processed', 'Updated existing CI', ci.id);
      } else if (processingOptions.autoCreate !== false) {
        ci = await this._createCiFromDiscoveredData(discoveredData);
        await this._updateDiscoveredItemStatus(itemId, 'Processed', 'Created new CI', ci.id);
      } else {
        await this._updateDiscoveredItemStatus(itemId, 'New', 'Requires manual review');
      }
      return ci;
    } catch (error) {
      logger.error('Error processing discovered item:', error);
      await this._updateDiscoveredItemStatus(itemId, 'Error', `Processing failed: ${error.message}`);
      throw new Error('Failed to process discovered item');
    }
  }

  /**
   * Create or update discovery schedule
   */
  async createDiscoverySchedule(scheduleData) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const schedule = await client.discoverySchedule.create({
        data: { ...scheduleData, nextRunDate: this._calculateNextRunDate(scheduleData.cronExpression) }
      });
      logger.info(`Discovery schedule created: ${schedule.name}`);
      return schedule;
    } catch (error) {
      logger.error('Error creating discovery schedule:', error);
      throw new Error('Failed to create discovery schedule');
    }
  }

  /**
   * Get discovery schedules
   */
  async getDiscoverySchedules() {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      return await client.discoverySchedule.findMany({ orderBy: { name: 'asc' } });
    } catch (error) {
      logger.error('Error fetching discovery schedules:', error);
      throw new Error('Failed to fetch discovery schedules');
    }
  }

  // ============================================================================
  // DISCOVERY IMPLEMENTATION METHODS
  // ============================================================================

  /**
   * Execute discovery based on type
   */
  async _executeDiscovery(runId, config) {
    try {
      let discoveredItems = [];

      switch (config.discoveryType) {
        case 'Network':
          discoveredItems = await this._discoverNetwork(config.scopeConfiguration);
          break;
        case 'Windows':
          discoveredItems = await this._discoverWindows(config.scopeConfiguration);
          break;
        case 'Linux':
          discoveredItems = await this._discoverLinux(config.scopeConfiguration);
          break;
        case 'Cloud':
          discoveredItems = await this._discoverCloud(config.scopeConfiguration);
          break;
        case 'Database':
          discoveredItems = await this._discoverDatabase(config.scopeConfiguration);
          break;
        default:
          throw new Error(`Unsupported discovery type: ${config.discoveryType}`);
      }

      // Store discovered items
      const createdItems = [];
      for (const item of discoveredItems) {
        const discoveredItem = await this.client.discoveredItem.create({
          data: {
            runId,
            discoveredData: item,
            fingerprint: this._generateFingerprint(item),
            status: 'New'
          }
        });
        createdItems.push(discoveredItem);
      }

      // Update discovery run status
      await this._updateDiscoveryRunStatus(runId, 'Completed', {
        itemsDiscovered: discoveredItems.length
      });

      logger.info(`Discovery completed: ${runId} - ${discoveredItems.length} items discovered`);
      return createdItems;
    } catch (error) {
      logger.error('Discovery execution failed:', error);
      await this._updateDiscoveryRunStatus(runId, 'Failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Network discovery implementation
   */
  async _discoverNetwork(config) {
    const discoveredItems = [];
    
    try {
      const { ipRange, scanPorts = [22, 80, 443, 3389] } = config;
      
      // Simple ping sweep for demonstration
      // In production, this would use more sophisticated tools like nmap
      const ipAddresses = this._generateIpRange(ipRange);
      
      for (const ip of ipAddresses.slice(0, 10)) { // Limit for demo
        try {
          // Ping disabled by default; enable 'ping' package for real ICMP checks
          // const pingResult = await (await import('ping')).promise.probe(ip, { timeout: 2 });
          const pingResult = { alive: false };
          
          if (pingResult.alive) {
            const deviceData = {
              name: `Device-${ip}`,
              ipAddress: ip,
              discoveryType: 'Network',
              discoveredAt: new Date(),
              alive: true,
              responseTime: pingResult.time,
              ciType: 'network-device'
            };

            // Try to determine device type through port scanning (simplified)
            deviceData.openPorts = await this._scanPorts(ip, scanPorts);
            deviceData.deviceType = this._inferDeviceType(deviceData.openPorts);

            discoveredItems.push(deviceData);
          }
        } catch (error) {
          logger.debug(`Failed to ping ${ip}:`, error.message);
        }
      }
    } catch (error) {
      logger.error('Network discovery failed:', error);
    }

    return discoveredItems;
  }

  /**
   * Windows discovery implementation
   */
  async _discoverWindows(config) {
    const discoveredItems = [];
    
    try {
      // This would typically use WMI, PowerShell, or Windows APIs
      // For demonstration, we'll simulate some data
      const simulatedWindows = [
        {
          name: 'WORKSTATION-001',
          hostname: 'workstation-001.corp.local',
          operatingSystem: 'Windows 10 Enterprise',
          version: '10.0.19044',
          manufacturer: 'Dell Inc.',
          model: 'OptiPlex 7090',
          serialNumber: 'DL123456789',
          memory: '16 GB',
          processor: 'Intel Core i7-11700',
          diskSpace: '512 GB SSD',
          ciType: 'computer',
          subType: 'workstation',
          discoveryType: 'Windows',
          discoveredAt: new Date()
        }
      ];

      discoveredItems.push(...simulatedWindows);
    } catch (error) {
      logger.error('Windows discovery failed:', error);
    }

    return discoveredItems;
  }

  /**
   * Linux discovery implementation
   */
  async _discoverLinux(config) {
    const discoveredItems = [];
    
    try {
      // This would typically use SSH, SNMP, or Linux-specific tools
      // For demonstration, we'll simulate some data
      const simulatedLinux = [
        {
          name: 'SERVER-001',
          hostname: 'server-001.corp.local',
          operatingSystem: 'Ubuntu 22.04 LTS',
          kernel: '5.15.0-72-generic',
          architecture: 'x86_64',
          memory: '32 GB',
          processor: 'AMD EPYC 7543P',
          diskSpace: '1 TB NVMe',
          uptime: '45 days',
          ciType: 'server',
          subType: 'linux-server',
          discoveryType: 'Linux',
          discoveredAt: new Date()
        }
      ];

      discoveredItems.push(...simulatedLinux);
    } catch (error) {
      logger.error('Linux discovery failed:', error);
    }

    return discoveredItems;
  }

  /**
   * Cloud discovery implementation
   */
  async _discoverCloud(config) {
    const discoveredItems = [];
    
    try {
      // This would integrate with cloud APIs (AWS, Azure, GCP)
      // For demonstration, we'll simulate some cloud resources
      const simulatedCloudResources = [
        {
          name: 'web-server-ec2',
          cloudProvider: 'AWS',
          resourceType: 'EC2 Instance',
          instanceId: 'i-0123456789abcdef0',
          instanceType: 't3.medium',
          region: 'us-east-1',
          availabilityZone: 'us-east-1a',
          vpc: 'vpc-12345678',
          subnet: 'subnet-87654321',
          publicIp: '54.123.45.67',
          privateIp: '10.0.1.100',
          state: 'running',
          ciType: 'virtual-machine',
          subType: 'ec2-instance',
          discoveryType: 'Cloud',
          discoveredAt: new Date()
        }
      ];

      discoveredItems.push(...simulatedCloudResources);
    } catch (error) {
      logger.error('Cloud discovery failed:', error);
    }

    return discoveredItems;
  }

  /**
   * Database discovery implementation
   */
  async _discoverDatabase(config) {
    const discoveredItems = [];
    
    try {
      // This would connect to databases and discover schema information
      // For demonstration, we'll simulate some database instances
      const simulatedDatabases = [
        {
          name: 'production-db',
          databaseType: 'PostgreSQL',
          version: '14.8',
          host: 'db.corp.local',
          port: 5432,
          databases: ['nova_universe', 'inventory', 'audit'],
          size: '250 GB',
          connections: 45,
          uptime: '123 days',
          ciType: 'database',
          subType: 'postgresql',
          discoveryType: 'Database',
          discoveredAt: new Date()
        }
      ];

      discoveredItems.push(...simulatedDatabases);
    } catch (error) {
      logger.error('Database discovery failed:', error);
    }

    return discoveredItems;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Update discovery run status
   */
  async _updateDiscoveryRunStatus(runId, status, updates = {}) {
    try {
      const client = await this.client;
      if (!client) return;
      await client.discoveryRun.update({ where: { id: runId }, data: { status, endTime: status === 'Completed' || status === 'Failed' ? new Date() : undefined, ...updates } });
    } catch (error) { logger.error('Error updating discovery run status:', error); }
  }

  /**
   * Update discovered item status
   */
  async _updateDiscoveredItemStatus(itemId, status, notes, ciId = null) {
    try {
      const client = await this.client;
      if (!client) return;
      await client.discoveredItem.update({ where: { id: itemId }, data: { status, processingNotes: notes, processedAt: new Date(), ciId } });
    } catch (error) { logger.error('Error updating discovered item status:', error); }
  }

  /**
   * Generate fingerprint for discovered item
   */
  _generateFingerprint(item) {
    // Create a unique fingerprint based on key identifying attributes
    const identifiers = [
      item.serialNumber,
      item.macAddress,
      item.hostname,
      item.ipAddress,
      item.instanceId
    ].filter(Boolean);

    if (identifiers.length === 0) {
      identifiers.push(item.name, item.discoveryType);
    }

    return Buffer.from(identifiers.join('|')).toString('base64');
  }

  /**
   * Find existing CI based on discovered data
   */
  async _findExistingCi(discoveredData) {
    try {
      const client = await this.client;
      if (!client) return null;
      if (discoveredData.serialNumber) {
        const ci = await client.configurationItem.findFirst({ where: { serialNumber: discoveredData.serialNumber } });
        if (ci) return ci;
      }
      if (discoveredData.hostname) {
        const ci = await client.configurationItem.findFirst({ where: { name: discoveredData.hostname } });
        if (ci) return ci;
      }
      if (discoveredData.ipAddress) {
        const ci = await client.configurationItem.findFirst({ where: { networkDetails: { ipAddress: discoveredData.ipAddress } } });
        if (ci) return ci;
      }
      return null;
    } catch (error) { logger.error('Error finding existing CI:', error); return null; }
  }

  /**
   * Update existing CI with discovered data
   */
  async _updateExistingCi(existingCi, discoveredData) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const updateData = { lastDiscoveredDate: new Date(), isDiscovered: true, discoverySource: discoveredData.discoveryType };
      if (discoveredData.operatingSystem) {
        updateData.attributes = { ...existingCi.attributes, operatingSystem: discoveredData.operatingSystem, version: discoveredData.version };
      }
      const updatedCi = await client.configurationItem.update({ where: { id: existingCi.id }, data: updateData });
      logger.info(`Updated existing CI: ${updatedCi.ciId} from discovery`);
      return updatedCi;
    } catch (error) { logger.error('Error updating existing CI:', error); throw error; }
  }

  /**
   * Create CI from discovered data
   */
  async _createCiFromDiscoveredData(discoveredData) {
    try {
      const client = await this.client;
      if (!client) throw new Error('CMDB Prisma client unavailable');
      const ciData = { name: discoveredData.hostname || discoveredData.name, displayName: discoveredData.name, description: `Discovered ${discoveredData.discoveryType} device`, ciType: this._mapToCiType(discoveredData.ciType), ciSubType: discoveredData.subType, serialNumber: discoveredData.serialNumber, manufacturer: discoveredData.manufacturer, model: discoveredData.model, isDiscovered: true, firstDiscoveredDate: new Date(), lastDiscoveredDate: new Date(), discoverySource: discoveredData.discoveryType, attributes: discoveredData };
      const ciId = await this._generateCiId();
      ciData.ciId = ciId;
      const ci = await client.configurationItem.create({ data: ciData });
      logger.info(`Created new CI from discovery: ${ci.ciId}`);
      return ci;
    } catch (error) { logger.error('Error creating CI from discovered data:', error); throw error; }
  }

  /**
   * Map discovery type to CI type
   */
  _mapToCiType(discoveryType) {
    const typeMapping = {
      'computer': 'hardware',
      'server': 'hardware',
      'workstation': 'hardware',
      'network-device': 'network',
      'virtual-machine': 'virtual',
      'database': 'database',
      'ec2-instance': 'virtual'
    };

    return typeMapping[discoveryType] || 'hardware';
  }

  /**
   * Generate CI ID
   */
  async _generateCiId() {
    const client = await this.client;
    if (!client) return 'CI000001';
    const prefix = 'CI';
    let ciId; let exists = true;
    while (exists) {
      const number = Math.floor(100000 + Math.random() * 900000);
      ciId = `${prefix}${number}`;
      const existing = await client.configurationItem.findUnique({ where: { ciId } });
      exists = !!existing;
    }
    return ciId;
  }

  /**
   * Generate IP range for network discovery
   */
  _generateIpRange(ipRange) {
    // Simple implementation for CIDR notation
    // In production, use a proper IP range library
    const [baseIp, mask] = ipRange.split('/');
    const ips = [];
    
    // For demo, just generate a few IPs
    const baseParts = baseIp.split('.');
    const baseNum = parseInt(baseParts[3]);
    
    for (let i = 0; i < 10; i++) {
      const newIp = `${baseParts[0]}.${baseParts[1]}.${baseParts[2]}.${baseNum + i}`;
      ips.push(newIp);
    }
    
    return ips;
  }

  /**
   * Scan ports on an IP address
   */
  async _scanPorts(ip, ports) {
    // Simplified port scanning - in production use proper tools
    const openPorts = [];
    
    for (const port of ports) {
      try {
        // This is a very basic check - use proper port scanning tools in production
        const { stdout } = await promisify(exec)(`timeout 2 nc -z ${ip} ${port} && echo "open" || echo "closed"`, { timeout: 3000 });
        if (stdout.trim() === 'open') {
          openPorts.push(port);
        }
      } catch (error) {
        // Port is likely closed or filtered
      }
    }
    
    return openPorts;
  }

  /**
   * Infer device type from open ports
   */
  _inferDeviceType(openPorts) {
    if (openPorts.includes(22)) return 'linux-server';
    if (openPorts.includes(3389)) return 'windows-server';
    if (openPorts.includes(80) || openPorts.includes(443)) return 'web-server';
    if (openPorts.includes(161)) return 'network-device';
    return 'unknown-device';
  }

  /**
   * Calculate next run date from cron expression
   */
  _calculateNextRunDate(cronExpression) {
    // Minimal cron-like support: '@hourly', '@daily', '@weekly', or '*/Nmin'
    if (cronExpression === '@hourly') return new Date(Date.now() + 60 * 60 * 1000);
    if (cronExpression === '@daily') return new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (cronExpression === '@weekly') return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const match = /^\*\/(\d+)min$/.exec(cronExpression || '');
    if (match) {
      const minutes = Math.max(1, Math.min(1440, parseInt(match[1], 10)));
      return new Date(Date.now() + minutes * 60 * 1000);
    }
    // Default fallback: 1 hour
    return new Date(Date.now() + 60 * 60 * 1000);
  }
}
