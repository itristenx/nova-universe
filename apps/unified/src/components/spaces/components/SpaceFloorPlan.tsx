/**
 * Interactive Floor Plan Component for Nova Spaces
 * Enterprise-grade floor plan visualization and space management
 */

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Download, Maximize, Grid, Eye, EyeOff, Building } from 'lucide-react';
import { Button } from '../../../../../../packages/design-system';
import { Card, CardBody } from '../../../../../../packages/design-system';
import './SpaceFloorPlan.css';

interface SpaceFloorPlanProps {
  buildingId?: string;
  floorId?: string;
  onSpaceSelect?: (spaceId: string) => void;
  onRoomBook?: (spaceId: string) => void;
  className?: string;
}

interface FloorPlanSpace {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  x: number;
  y: number;
  width: number;
  height: number;
  capacity?: number;
  currentOccupancy?: number;
}

export function SpaceFloorPlan({
  buildingId = 'main-building',
  floorId = 'floor-1',
  onSpaceSelect,
  onRoomBook,
  className,
}: SpaceFloorPlanProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Mock floor plan data - would come from API
  const floorPlanSpaces: FloorPlanSpace[] = [
    {
      id: 'meeting-001',
      name: 'Conference A',
      type: 'conference_room',
      status: 'available',
      x: 50,
      y: 50,
      width: 120,
      height: 80,
      capacity: 8,
    },
    {
      id: 'meeting-002',
      name: 'Conference B',
      type: 'conference_room',
      status: 'occupied',
      x: 200,
      y: 50,
      width: 120,
      height: 80,
      capacity: 12,
      currentOccupancy: 7,
    },
    {
      id: 'desk-001',
      name: 'Hot Desk 1',
      type: 'hot_desk',
      status: 'available',
      x: 50,
      y: 150,
      width: 60,
      height: 40,
      capacity: 1,
    },
    {
      id: 'desk-002',
      name: 'Hot Desk 2',
      type: 'hot_desk',
      status: 'occupied',
      x: 130,
      y: 150,
      width: 60,
      height: 40,
      capacity: 1,
      currentOccupancy: 1,
    },
    {
      id: 'phone-001',
      name: 'Phone Booth 1',
      type: 'phone_booth',
      status: 'available',
      x: 350,
      y: 50,
      width: 40,
      height: 40,
      capacity: 1,
    },
    {
      id: 'phone-002',
      name: 'Phone Booth 2',
      type: 'phone_booth',
      status: 'maintenance',
      x: 350,
      y: 100,
      width: 40,
      height: 40,
      capacity: 1,
    },
    {
      id: 'focus-001',
      name: 'Focus Room A',
      type: 'focus_room',
      status: 'reserved',
      x: 50,
      y: 220,
      width: 80,
      height: 60,
      capacity: 2,
    },
    {
      id: 'open-001',
      name: 'Open Area',
      type: 'open_space',
      status: 'available',
      x: 200,
      y: 180,
      width: 150,
      height: 100,
      capacity: 20,
      currentOccupancy: 12,
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'occupied':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      case 'reserved':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusOpacity = (status: string): string => {
    return status === 'occupied' ? '0.8' : '0.6';
  };

  const handleSpaceClick = (space: FloorPlanSpace) => {
    setSelectedSpace(space.id);
    onSpaceSelect?.(space.id);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredSpaces = filterStatus
    ? floorPlanSpaces.filter((space) => space.status === filterStatus)
    : floorPlanSpaces;

  return (
    <div className={`space-floorplan ${className || ''}`}>
      {/* Toolbar */}
      <div className="floorplan-toolbar">
        <div className="toolbar-left">
          <label htmlFor="floorplan-status-filter" className="sr-only">
            Filter spaces by status
          </label>
          <select
            id="floorplan-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            aria-label="Filter spaces by status"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        <div className="toolbar-center">
          <span className="floor-info">
            <Building className="icon-sm" />
            Main Building - Floor 1
          </span>
        </div>

        <div className="toolbar-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? 'active' : ''}
          >
            <Grid className="icon-sm" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className={showLabels ? 'active' : ''}
          >
            {showLabels ? <Eye className="icon-sm" /> : <EyeOff className="icon-sm" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="icon-sm" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="icon-sm" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <Maximize className="icon-sm" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="icon-sm" />
          </Button>
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div className="floorplan-canvas">
        <svg
          ref={svgRef}
          width="100%"
          height="500"
          viewBox="0 0 500 300"
          className={`floorplan-svg ${isPanning ? 'grabbing' : 'grab'}`}
        >
          {/* Grid Pattern */}
          {showGrid && (
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
            </defs>
          )}

          {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

          {/* Building Outline */}
          <rect
            x="30"
            y="30"
            width="440"
            height="240"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            rx="4"
          />

          {/* Spaces */}
          {filteredSpaces.map((space) => (
            <g key={space.id}>
              {/* Space Rectangle */}
              <rect
                x={space.x}
                y={space.y}
                width={space.width}
                height={space.height}
                fill={getStatusColor(space.status)}
                fillOpacity={getStatusOpacity(space.status)}
                stroke={selectedSpace === space.id ? '#1f2937' : '#374151'}
                strokeWidth={selectedSpace === space.id ? 3 : 1}
                rx="2"
                className="space-rect"
                onClick={() => handleSpaceClick(space)}
              />

              {/* Space Label */}
              {showLabels && (
                <text
                  x={space.x + space.width / 2}
                  y={space.y + space.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#1f2937"
                  fontWeight="500"
                  className="space-label"
                  onClick={() => handleSpaceClick(space)}
                >
                  {space.name}
                </text>
              )}

              {/* Occupancy Indicator */}
              {space.currentOccupancy !== undefined && (
                <text
                  x={space.x + space.width - 5}
                  y={space.y + 12}
                  textAnchor="end"
                  fontSize="8"
                  fill="#1f2937"
                  fontWeight="600"
                  className="occupancy-indicator"
                >
                  {space.currentOccupancy}/{space.capacity}
                </text>
              )}
            </g>
          ))}

          {/* Legend */}
          <g className="legend" transform="translate(350, 220)">
            <rect
              x="0"
              y="0"
              width="110"
              height="70"
              fill="white"
              stroke="#d1d5db"
              rx="4"
              fillOpacity="0.9"
            />
            <text x="55" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">
              Status Legend
            </text>

            <circle cx="10" cy="25" r="4" fill="#10b981" />
            <text x="18" y="28" fontSize="8" fill="#374151">
              Available
            </text>

            <circle cx="10" cy="35" r="4" fill="#ef4444" />
            <text x="18" y="38" fontSize="8" fill="#374151">
              Occupied
            </text>

            <circle cx="10" cy="45" r="4" fill="#f59e0b" />
            <text x="18" y="48" fontSize="8" fill="#374151">
              Maintenance
            </text>

            <circle cx="10" cy="55" r="4" fill="#3b82f6" />
            <text x="18" y="58" fontSize="8" fill="#374151">
              Reserved
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Space Info */}
      {selectedSpace && (
        <Card className="selected-space-info">
          <CardBody>
            {(() => {
              const space = floorPlanSpaces.find((s) => s.id === selectedSpace);
              if (!space) return null;

              return (
                <div className="space-info-content">
                  <div className="space-info-header">
                    <h4>{space.name}</h4>
                    <span className={`status-badge ${space.status}`}>
                      {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-info-details">
                    <span>Type: {space.type.replace('_', ' ')}</span>
                    <span>Capacity: {space.capacity}</span>
                    {space.currentOccupancy !== undefined && (
                      <span>
                        Current: {space.currentOccupancy}/{space.capacity}
                      </span>
                    )}
                  </div>
                  <div className="space-info-actions">
                    {space.status === 'available' && (
                      <Button size="sm" onClick={() => onRoomBook?.(space.id)}>
                        Book Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
