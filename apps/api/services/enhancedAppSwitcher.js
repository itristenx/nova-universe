/**
 * Enhanced App Switcher Service
 * Production-ready app management with Okta/AD SSO integration
 */

import { logger } from '../logger.js';

class EnhancedAppSwitcherService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get user's personalized app dashboard
   */
  async getUserDashboard(userId, options = {}) {
    try {
      const {
        view = 'all', // all, favorites, recent, categories, collection
        collectionId = null,
        categoryId = null,
        search = '',
        limit = 50,
        offset = 0,
      } = options;

      // Get user's dashboard configuration
      const dashboardConfig = await this.getUserDashboardConfig(userId);

      let query = `
        SELECT 
          uaa.app_id,
          a.name,
          a.description,
          a.url,
          a.icon_url,
          a.background_color,
          a.text_color,
          a.app_type,
          a.launch_config,
          a.is_featured,
          ac.name as category_name,
          ac.color as category_color,
          ac.icon as category_icon,
          uaa.is_favorite,
          uaa.is_pinned,
          uaa.custom_name,
          uaa.sort_order,
          uaa.last_access,
          uaa.access_count,
          COALESCE(recent_usage.usage_30d, 0) as usage_30d,
          COALESCE(app_stats.avg_rating, 0) as rating,
          COALESCE(app_stats.total_users, 0) as total_users
        FROM user_app_assignments uaa
        JOIN applications a ON uaa.app_id = a.id
        LEFT JOIN app_categories ac ON a.category_id = ac.id
        LEFT JOIN (
          SELECT 
            app_id, 
            COUNT(*) as usage_30d
          FROM app_usage_logs 
          WHERE user_id = $1 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
            AND action = 'launch'
          GROUP BY app_id
        ) recent_usage ON a.id = recent_usage.app_id
        LEFT JOIN (
          SELECT 
            a.id,
            AVG(ar.rating) as avg_rating,
            COUNT(DISTINCT uaa2.user_id) as total_users
          FROM applications a
          LEFT JOIN app_reviews ar ON a.id = ar.app_id AND ar.is_approved = true
          LEFT JOIN user_app_assignments uaa2 ON a.id = uaa2.app_id AND uaa2.revoked_at IS NULL
          GROUP BY a.id
        ) app_stats ON a.id = app_stats.id
        WHERE uaa.user_id = $1
          AND uaa.revoked_at IS NULL
          AND a.is_active = true
          AND (uaa.expires_at IS NULL OR uaa.expires_at > CURRENT_TIMESTAMP)
      `;

      const params = [userId];
      let paramIndex = 2;

      // Apply view filters
      switch (view) {
        case 'favorites':
          query += ` AND uaa.is_favorite = true`;
          break;
        case 'recent':
          query += ` AND uaa.last_access >= CURRENT_TIMESTAMP - INTERVAL '30 days'`;
          break;
        case 'pinned':
          query += ` AND uaa.is_pinned = true`;
          break;
        case 'categories':
          if (categoryId) {
            query += ` AND a.category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
          }
          break;
        case 'collection':
          if (collectionId) {
            query += ` AND EXISTS (
              SELECT 1 FROM app_collection_items aci 
              WHERE aci.app_id = a.id AND aci.collection_id = $${paramIndex}
            )`;
            params.push(collectionId);
            paramIndex++;
          }
          break;
      }

      // Apply search filter
      if (search) {
        query += ` AND (
          LOWER(a.name) LIKE LOWER($${paramIndex}) OR 
          LOWER(a.description) LIKE LOWER($${paramIndex}) OR
          LOWER(uaa.custom_name) LIKE LOWER($${paramIndex})
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Apply sorting
      const sortBy =
        dashboardConfig.default_view === 'recent'
          ? 'uaa.last_access DESC'
          : view === 'favorites'
            ? 'uaa.sort_order, a.name'
            : 'a.is_featured DESC, uaa.sort_order, a.name';

      query += ` ORDER BY ${sortBy}`;

      // Apply pagination
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await this.db.query(query, params);

      // Get categories for organization
      const categories = await this.getAppCategories();

      // Get user's collections
      const collections = await this.getUserCollections(userId);

      return {
        apps: result.rows.map((app) => this.formatAppForDashboard(app)),
        categories,
        collections,
        dashboardConfig,
        pagination: {
          limit,
          offset,
          hasMore: result.rows.length === limit,
        },
      };
    } catch (error) {
      logger.error('Error getting user dashboard:', error);
      throw error;
    }
  }

  /**
   * Get user's dashboard configuration
   */
  async getUserDashboardConfig(userId) {
    try {
      const result = await this.db.query(
        `
        SELECT * FROM user_dashboard_configs WHERE user_id = $1
      `,
        [userId],
      );

      if (result.rows.length === 0) {
        // Create default configuration
        const defaultConfig = {
          user_id: userId,
          layout_type: 'grid',
          apps_per_row: 6,
          show_app_names: true,
          show_descriptions: false,
          show_categories: true,
          default_view: 'all',
          auto_launch_behavior: 'same_tab',
          show_usage_stats: true,
          enable_recommendations: true,
          theme: 'auto',
          track_usage: true,
          share_usage_analytics: true,
        };

        await this.db.query(
          `
          INSERT INTO user_dashboard_configs (
            user_id, layout_type, apps_per_row, show_app_names, show_descriptions,
            show_categories, default_view, auto_launch_behavior, show_usage_stats,
            enable_recommendations, theme, track_usage, share_usage_analytics
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `,
          [
            defaultConfig.user_id,
            defaultConfig.layout_type,
            defaultConfig.apps_per_row,
            defaultConfig.show_app_names,
            defaultConfig.show_descriptions,
            defaultConfig.show_categories,
            defaultConfig.default_view,
            defaultConfig.auto_launch_behavior,
            defaultConfig.show_usage_stats,
            defaultConfig.enable_recommendations,
            defaultConfig.theme,
            defaultConfig.track_usage,
            defaultConfig.share_usage_analytics,
          ],
        );

        return defaultConfig;
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user dashboard config:', error);
      throw error;
    }
  }

  /**
   * Update user dashboard configuration
   */
  async updateUserDashboardConfig(userId, config) {
    try {
      const allowedFields = [
        'layout_type',
        'apps_per_row',
        'show_app_names',
        'show_descriptions',
        'show_categories',
        'default_view',
        'auto_launch_behavior',
        'show_usage_stats',
        'enable_recommendations',
        'theme',
        'primary_color',
        'track_usage',
        'share_usage_analytics',
      ];

      const updates = [];
      const values = [userId];
      let valueIndex = 2;

      Object.keys(config).forEach((key) => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = $${valueIndex}`);
          values.push(config[key]);
          valueIndex++;
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid configuration fields provided');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE user_dashboard_configs 
        SET ${updates.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user dashboard config:', error);
      throw error;
    }
  }

  /**
   * Generate SSO launch URL for application
   */
  async generateLaunchUrl(userId, appId, context = {}) {
    try {
      // Get application details
      const appResult = await this.db.query(
        `
        SELECT a.*, asc.config as sso_config, sp.provider_type, sp.config as provider_config
        FROM applications a
        LEFT JOIN app_sso_configs asc ON a.id = asc.app_id AND asc.is_active = true
        LEFT JOIN sso_providers sp ON asc.sso_provider_id = sp.id
        WHERE a.id = $1 AND a.is_active = true
      `,
        [appId],
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const app = appResult.rows[0];

      // Check if user has access
      const accessResult = await this.db.query(
        `
        SELECT 1 FROM user_app_assignments 
        WHERE user_id = $1 AND app_id = $2 AND revoked_at IS NULL
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `,
        [userId, appId],
      );

      if (accessResult.rows.length === 0) {
        throw new Error('Access denied');
      }

      let launchUrl = app.url;
      let requiresNewWindow = app.launch_config?.open_in_new_window || false;
      let ssoEnabled = false;

      // Generate SSO URL if configured
      if (app.sso_config && app.provider_type) {
        ssoEnabled = true;
        launchUrl = await this.generateSSOUrl(userId, app, context);
        requiresNewWindow = app.launch_config?.open_in_new_window || true;
      }

      // Log the usage
      await this.logAppUsage(userId, appId, 'launch', context);

      return {
        url: launchUrl,
        requires_new_window: requiresNewWindow,
        sso_enabled: ssoEnabled,
        app_type: app.app_type,
        custom_headers: app.sso_config?.custom_headers || {},
      };
    } catch (error) {
      logger.error('Error generating launch URL:', error);
      throw error;
    }
  }

  /**
   * Generate SSO URL using Okta/AD provider
   */
  async generateSSOUrl(userId, app, context) {
    try {
      const { provider_type, provider_config: _providerConfig, sso_config: _ssoConfig } = app;

      switch (provider_type) {
        case 'okta':
          return this.generateOktaSSO(userId, app, context);
        case 'azure_ad':
          return this.generateAzureADSSO(userId, app, context);
        case 'saml':
          return this.generateSAMLSSO(userId, app, context);
        case 'oidc':
          return this.generateOIDCSSO(userId, app, context);
        default:
          // Fallback to header-based auth
          return this.generateHeaderBasedSSO(userId, app, context);
      }
    } catch (error) {
      logger.error('Error generating SSO URL:', error);
      throw error;
    }
  }

  /**
   * Generate Okta SSO URL
   */
  async generateOktaLaunchUrl(app, user, redirectUri) {
    try {
      const { provider_config: _providerConfig, sso_config: _ssoConfig } = app;

      // In production, this would integrate with Okta SDK
      // For now, return a placeholder that follows Okta patterns
      const state = this.generateState(user.id, app.id, { redirect_uri: redirectUri });
      const baseUrl =
        process.env.API_BASE_URL ||
        process.env.BASE_URL ||
        process.env.PUBLIC_URL ||
        'http://localhost:3000';
      const encodedRedirectUri = encodeURIComponent(
        `${baseUrl}/api/v1/app-switcher/sso/callback/${app.id}`,
      );

      return (
        `${app.provider_config.issuer}/oauth2/v1/authorize?` +
        `client_id=${app.provider_config.client_id}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `redirect_uri=${encodedRedirectUri}&` +
        `state=${state}`
      );
    } catch (error) {
      this.logger.error('Okta SSO generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate Azure AD SSO URL
   */
  async generateAzureADSSO(userId, app, context) {
    try {
      const { provider_config: _providerConfig, sso_config: _ssoConfig } = app;

      const state = this.generateState(userId, app.id, context);
      const baseUrl =
        process.env.API_BASE_URL ||
        process.env.BASE_URL ||
        process.env.PUBLIC_URL ||
        'http://localhost:3000';
      const redirectUri = encodeURIComponent(
        `${baseUrl}/api/v1/app-switcher/sso/callback/${app.id}`,
      );

      return (
        `https://login.microsoftonline.com/${app.provider_config.tenant_id}/oauth2/v2.0/authorize?` +
        `client_id=${app.provider_config.client_id}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `redirect_uri=${redirectUri}&` +
        `state=${state}`
      );
    } catch (error) {
      this.logger.error('Azure AD SSO generation failed:', error);
      throw error;
    }
  }

  /**
   * Log app usage for analytics
   */
  async logAppUsage(userId, appId, action, context = {}) {
    try {
      const {
        sessionId = null,
        ipAddress = null,
        userAgent = null,
        launchMethod = 'dashboard',
        deviceInfo = {},
        locationInfo = {},
      } = context;

      await this.db.query(
        `
        INSERT INTO app_usage_logs (
          user_id, app_id, action, session_id, ip_address, user_agent,
          launch_method, device_info, location_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          userId,
          appId,
          action,
          sessionId,
          ipAddress,
          userAgent,
          launchMethod,
          JSON.stringify(deviceInfo),
          JSON.stringify(locationInfo),
        ],
      );

      // Update user assignment access tracking
      if (action === 'launch') {
        await this.db.query(
          `
          UPDATE user_app_assignments SET
            last_access = CURRENT_TIMESTAMP,
            access_count = access_count + 1,
            first_access = COALESCE(first_access, CURRENT_TIMESTAMP)
          WHERE user_id = $1 AND app_id = $2
        `,
          [userId, appId],
        );
      }
    } catch (error) {
      logger.error('Error logging app usage:', error);
      // Don't throw here as it shouldn't block the main operation
    }
  }

  /**
   * Get app categories
   */
  async getAppCategories() {
    try {
      const result = await this.db.query(`
        SELECT 
          c.*,
          COUNT(a.id) as app_count
        FROM app_categories c
        LEFT JOIN applications a ON c.id = a.category_id AND a.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.sort_order, c.name
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting app categories:', error);
      throw error;
    }
  }

  /**
   * Get user's collections
   */
  async getUserCollections(userId) {
    try {
      const result = await this.db.query(
        `
        SELECT 
          c.*,
          COUNT(aci.app_id) as app_count
        FROM app_collections c
        LEFT JOIN app_collection_items aci ON c.id = aci.collection_id
        WHERE (c.type = 'personal' AND c.owner_user_id = $1)
           OR (c.type = 'system' AND c.visibility IN ('private', 'organization'))
           OR (c.visibility = 'organization')
        GROUP BY c.id
        ORDER BY c.type, c.sort_order, c.name
      `,
        [userId],
      );

      return result.rows;
    } catch (error) {
      logger.error('Error getting user collections:', error);
      throw error;
    }
  }

  /**
   * Create or update application
   */
  async saveApplication(appData, userId) {
    try {
      const {
        id = null,
        name,
        description,
        url,
        icon_url,
        category_id,
        app_type = 'external',
        auth_config = {},
        launch_config = {},
        background_color = '#FFFFFF',
        text_color = '#000000',
        is_featured = false,
        requires_approval = false,
        auto_assign_new_users = false,
        version,
        vendor,
        support_url,
        documentation_url,
      } = appData;

      if (id) {
        // Update existing application
        const result = await this.db.query(
          `
          UPDATE applications SET
            name = $1, description = $2, url = $3, icon_url = $4,
            category_id = $5, app_type = $6, auth_config = $7, launch_config = $8,
            background_color = $9, text_color = $10, is_featured = $11,
            requires_approval = $12, auto_assign_new_users = $13,
            version = $14, vendor = $15, support_url = $16, documentation_url = $17,
            updated_by = $18, updated_at = CURRENT_TIMESTAMP
          WHERE id = $19
          RETURNING *
        `,
          [
            name,
            description,
            url,
            icon_url,
            category_id,
            app_type,
            JSON.stringify(auth_config),
            JSON.stringify(launch_config),
            background_color,
            text_color,
            is_featured,
            requires_approval,
            auto_assign_new_users,
            version,
            vendor,
            support_url,
            documentation_url,
            userId,
            id,
          ],
        );

        return result.rows[0];
      } else {
        // Create new application
        const result = await this.db.query(
          `
          INSERT INTO applications (
            name, description, url, icon_url, category_id, app_type,
            auth_config, launch_config, background_color, text_color,
            is_featured, requires_approval, auto_assign_new_users,
            version, vendor, support_url, documentation_url, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *
        `,
          [
            name,
            description,
            url,
            icon_url,
            category_id,
            app_type,
            JSON.stringify(auth_config),
            JSON.stringify(launch_config),
            background_color,
            text_color,
            is_featured,
            requires_approval,
            auto_assign_new_users,
            version,
            vendor,
            support_url,
            documentation_url,
            userId,
          ],
        );

        const newApp = result.rows[0];

        // Auto-assign to creator
        await this.assignAppToUser(userId, newApp.id, 'direct', 'creator', userId);

        return newApp;
      }
    } catch (error) {
      logger.error('Error saving application:', error);
      throw error;
    }
  }

  /**
   * Assign app to user
   */
  async assignAppToUser(
    userId,
    appId,
    assignmentType = 'direct',
    assignmentSource = '',
    grantedBy,
  ) {
    try {
      await this.db.query(
        `
        SELECT assign_app_to_user($1, $2, $3, $4, $5)
      `,
        [userId, appId, assignmentType, assignmentSource, grantedBy],
      );

      return true;
    } catch (error) {
      logger.error('Error assigning app to user:', error);
      throw error;
    }
  }

  /**
   * Toggle app favorite status
   */
  async toggleFavorite(userId, appId) {
    try {
      const result = await this.db.query(
        `
        UPDATE user_app_assignments 
        SET is_favorite = NOT is_favorite
        WHERE user_id = $1 AND app_id = $2
        RETURNING is_favorite
      `,
        [userId, appId],
      );

      if (result.rows.length === 0) {
        throw new Error('App assignment not found');
      }

      await this.logAppUsage(userId, appId, result.rows[0].is_favorite ? 'favorite' : 'unfavorite');

      return result.rows[0].is_favorite;
    } catch (error) {
      logger.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get applications for admin view
   */
  async getApplicationsAdmin(options = {}) {
    try {
      const {
        search = '',
        categoryId = null,
        appType = null,
        status = 'active',
        limit = 50,
        offset = 0,
      } = options;

      let query = `
        SELECT 
          a.*,
          ac.name as category_name,
          ac.color as category_color,
          COUNT(DISTINCT uaa.user_id) as assigned_users,
          COUNT(DISTINCT aal.user_id) as active_users_30d,
          COALESCE(AVG(ar.rating), 0) as average_rating
        FROM applications a
        LEFT JOIN app_categories ac ON a.category_id = ac.id
        LEFT JOIN user_app_assignments uaa ON a.id = uaa.app_id AND uaa.revoked_at IS NULL
        LEFT JOIN app_usage_logs aal ON a.id = aal.app_id 
          AND aal.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
          AND aal.action = 'launch'
        LEFT JOIN app_reviews ar ON a.id = ar.app_id AND ar.is_approved = true
        WHERE a.status = $1
      `;

      const params = [status];
      let paramIndex = 2;

      if (search) {
        query += ` AND (
          LOWER(a.name) LIKE LOWER($${paramIndex}) OR 
          LOWER(a.description) LIKE LOWER($${paramIndex})
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (categoryId) {
        query += ` AND a.category_id = $${paramIndex}`;
        params.push(categoryId);
        paramIndex++;
      }

      if (appType) {
        query += ` AND a.app_type = $${paramIndex}`;
        params.push(appType);
        paramIndex++;
      }

      query += ` GROUP BY a.id, ac.name, ac.color ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await this.db.query(query, params);
      return { apps: result.rows };
    } catch (error) {
      logger.error('Error getting applications for admin:', error);
      throw error;
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(appId, userId) {
    try {
      // Soft delete by setting status to deleted
      const result = await this.db.query(
        `
        UPDATE applications 
        SET status = 'deleted', is_active = false, updated_by = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `,
        [userId, appId],
      );

      if (result.rows.length === 0) {
        throw new Error('Application not found');
      }

      // Revoke all user assignments
      await this.db.query(
        `
        UPDATE user_app_assignments 
        SET revoked_at = CURRENT_TIMESTAMP, revoked_by = $1, revoked_reason = 'Application deleted'
        WHERE app_id = $2 AND revoked_at IS NULL
      `,
        [userId, appId],
      );

      return true;
    } catch (error) {
      logger.error('Error deleting application:', error);
      throw error;
    }
  }

  /**
   * Get app recommendations for user
   */
  async getRecommendations(userId, limit = 10) {
    try {
      // Simple recommendation based on popular apps in user's department
      // In production, this would use ML algorithms
      const result = await this.db.query(
        `
        SELECT DISTINCT
          a.id,
          a.name,
          a.description,
          a.icon_url,
          a.background_color,
          ac.name as category_name,
          COUNT(DISTINCT aal.user_id) as popularity_score,
          'popular' as recommendation_type,
          'Highly used in your organization' as reason
        FROM applications a
        JOIN app_categories ac ON a.category_id = ac.id
        JOIN app_usage_logs aal ON a.id = aal.app_id 
          AND aal.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
          AND aal.action = 'launch'
        WHERE a.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM user_app_assignments uaa 
            WHERE uaa.user_id = $1 AND uaa.app_id = a.id AND uaa.revoked_at IS NULL
          )
        GROUP BY a.id, a.name, a.description, a.icon_url, a.background_color, ac.name
        ORDER BY popularity_score DESC
        LIMIT $2
      `,
        [userId, limit],
      );

      return result.rows;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Search applications
   */
  async searchApplications(userId, query, filters = {}) {
    try {
      const { categoryId, appType, featured, limit = 20 } = filters;

      let searchQuery = `
        SELECT DISTINCT
          a.id,
          a.name,
          a.description,
          a.url,
          a.icon_url,
          a.background_color,
          a.app_type,
          a.is_featured,
          ac.name as category_name,
          ac.color as category_color,
          uaa.is_favorite,
          CASE WHEN uaa.user_id IS NOT NULL THEN true ELSE false END as is_assigned,
          ts_rank(to_tsvector('english', a.name || ' ' || COALESCE(a.description, '')), plainto_tsquery('english', $2)) as relevance
        FROM applications a
        LEFT JOIN app_categories ac ON a.category_id = ac.id
        LEFT JOIN user_app_assignments uaa ON a.id = uaa.app_id AND uaa.user_id = $1 AND uaa.revoked_at IS NULL
        WHERE a.is_active = true
          AND (
            to_tsvector('english', a.name || ' ' || COALESCE(a.description, '')) @@ plainto_tsquery('english', $2)
            OR LOWER(a.name) LIKE LOWER($3)
            OR LOWER(a.description) LIKE LOWER($3)
          )
      `;

      const params = [userId, query, `%${query}%`];
      let paramIndex = 4;

      if (categoryId) {
        searchQuery += ` AND a.category_id = $${paramIndex}`;
        params.push(categoryId);
        paramIndex++;
      }

      if (appType) {
        searchQuery += ` AND a.app_type = $${paramIndex}`;
        params.push(appType);
        paramIndex++;
      }

      if (featured !== undefined) {
        searchQuery += ` AND a.is_featured = $${paramIndex}`;
        params.push(featured);
        paramIndex++;
      }

      searchQuery += ` ORDER BY relevance DESC, a.is_featured DESC, a.name LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await this.db.query(searchQuery, params);
      return result.rows;
    } catch (error) {
      logger.error('Error searching applications:', error);
      throw error;
    }
  }

  /**
   * Format app data for dashboard display
   */
  formatAppForDashboard(app) {
    return {
      id: app.app_id,
      name: app.custom_name || app.name,
      description: app.description,
      url: app.url,
      iconUrl: app.icon_url,
      backgroundColor: app.background_color,
      textColor: app.text_color,
      appType: app.app_type,
      launchConfig: app.launch_config,
      category: {
        name: app.category_name,
        color: app.category_color,
        icon: app.category_icon,
      },
      isFavorite: app.is_favorite,
      isPinned: app.is_pinned,
      isFeatured: app.is_featured,
      sortOrder: app.sort_order,
      lastAccess: app.last_access,
      accessCount: app.access_count,
      usage30d: app.usage_30d,
      rating: parseFloat(app.rating || 0),
      totalUsers: app.total_users || 0,
    };
  }

  /**
   * Generate secure state for SSO
   */
  generateState(userId, appId, context) {
    const data = {
      userId,
      appId,
      timestamp: Date.now(),
      context: context.sessionId || 'unknown',
    };

    // In production, use proper encryption/signing
    return Buffer.from(JSON.stringify(data)).toString('base64url');
  }

  /**
   * Get admin analytics
   */
  async getAdminAnalytics(timeframe = '30d') {
    try {
      const interval = timeframe === '7d' ? '7 days' : timeframe === '90d' ? '90 days' : '30 days';

      const analytics = await Promise.all([
        // Total apps and users
        this.db.query(`
          SELECT 
            COUNT(DISTINCT a.id) as total_apps,
            COUNT(DISTINCT uaa.user_id) as total_users,
            COUNT(DISTINCT aal.user_id) as active_users
          FROM applications a
          LEFT JOIN user_app_assignments uaa ON a.id = uaa.app_id AND uaa.revoked_at IS NULL
          LEFT JOIN app_usage_logs aal ON a.id = aal.app_id 
            AND aal.created_at >= CURRENT_TIMESTAMP - INTERVAL '${interval}'
          WHERE a.is_active = true
        `),

        // Usage trends
        this.db.query(`
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            COUNT(*) as launches,
            COUNT(DISTINCT user_id) as unique_users
          FROM app_usage_logs 
          WHERE action = 'launch' 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${interval}'
          GROUP BY DATE_TRUNC('day', created_at)
          ORDER BY date
        `),

        // Top apps
        this.db.query(`
          SELECT 
            a.name,
            COUNT(*) as launches,
            COUNT(DISTINCT aal.user_id) as unique_users
          FROM app_usage_logs aal
          JOIN applications a ON aal.app_id = a.id
          WHERE aal.action = 'launch' 
            AND aal.created_at >= CURRENT_TIMESTAMP - INTERVAL '${interval}'
          GROUP BY a.id, a.name
          ORDER BY launches DESC
          LIMIT 10
        `),
      ]);

      return {
        summary: analytics[0].rows[0],
        trends: analytics[1].rows,
        topApps: analytics[2].rows,
      };
    } catch (error) {
      logger.error('Error getting admin analytics:', error);
      throw error;
    }
  }
}

export default EnhancedAppSwitcherService;
