/**
 * Nova Universe Design System Demo & Testing Page
 * Complete showcase of all Phase 3 components and features
 */

import React, { useState } from 'react';
import {
  AccessibilityProvider,
  ThemeProvider,
  Button, PrimaryButton, OutlineButton, GhostButton,
  Input, Card, Modal, Toast, Progress, Spinner,
  useTheme,
  announceToScreenReader
} from '../../packages/design-system';

const demoStyles = `
.demo-page {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-content);
  font-family: var(--font-sans);
}

.demo-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  padding: var(--space-8);
  text-align: center;
}

.demo-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2) 0;
}

.demo-subtitle {
  font-size: var(--text-xl);
  margin: 0;
  opacity: 0.9;
}

.demo-controls {
  padding: var(--space-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-muted)20;
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.demo-content {
  padding: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: var(--space-12);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-6) 0;
  color: var(--color-content);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--space-2);
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.component-demo {
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-muted)20;
}

.component-demo h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
  color: var(--color-content);
}

.button-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.input-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-showcase {
  display: grid;
  gap: var(--space-4);
}

.progress-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.accessibility-demo {
  background: var(--color-muted)05;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  margin-top: var(--space-6);
}

.accessibility-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.feature-icon {
  font-size: var(--text-lg);
}

.feature-text {
  font-size: var(--text-sm);
  margin: 0;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 4px var(--color-success)60;
}

@media (max-width: 768px) {
  .demo-content {
    padding: var(--space-4);
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
  
  .button-showcase {
    flex-direction: column;
    align-items: stretch;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = demoStyles;
  document.head.appendChild(styleElement);
}

function ThemeControls() {
  const { colorMode, setColorMode } = useTheme();
  
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <OutlineButton
        size="sm"
        onClick={() => setColorMode('light')}
        style={{ 
          backgroundColor: colorMode === 'light' ? 'var(--color-primary)' : undefined,
          color: colorMode === 'light' ? 'white' : undefined
        }}
      >
        ☀️ Light
      </OutlineButton>
      <OutlineButton
        size="sm"
        onClick={() => setColorMode('dark')}
        style={{ 
          backgroundColor: colorMode === 'dark' ? 'var(--color-primary)' : undefined,
          color: colorMode === 'dark' ? 'white' : undefined
        }}
      >
        🌙 Dark
      </OutlineButton>
      <OutlineButton
        size="sm"
        onClick={() => setColorMode('high-contrast')}
        style={{ 
          backgroundColor: colorMode === 'high-contrast' ? 'var(--color-primary)' : undefined,
          color: colorMode === 'high-contrast' ? 'white' : undefined
        }}
      >
        🔆 High Contrast
      </OutlineButton>
    </div>
  );
}

function ComponentShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(65);
  const [loading, setLoading] = useState(false);

  const handleAccessibilityTest = () => {
    announceToScreenReader('Accessibility test activated. All components are WCAG 2.1 AA compliant.', 'assertive');
  };

  const handleLoadingTest = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000)); // TODO-LINT: move to async function
    setLoading(false);
    announceToScreenReader('Loading test completed successfully.');
  };

  return (
    <div className="demo-content">
      {/* Button Components */}
      <div className="demo-section">
        <h2 className="section-title">Button Components</h2>
        <div className="component-grid">
          <div className="component-demo">
            <h3>Primary Actions</h3>
            <div className="button-showcase">
              <PrimaryButton>Primary Button</PrimaryButton>
              <PrimaryButton size="sm">Small</PrimaryButton>
              <PrimaryButton size="lg">Large</PrimaryButton>
              <PrimaryButton loading={loading}>
                {loading ? 'Loading...' : 'Test Loading'}
              </PrimaryButton>
            </div>
          </div>

          <div className="component-demo">
            <h3>Button Variants</h3>
            <div className="button-showcase">
              <Button variant="secondary">Secondary</Button>
              <Button variant="accent">Accent</Button>
              <OutlineButton>Outline</OutlineButton>
              <GhostButton>Ghost</GhostButton>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Components */}
      <div className="demo-section">
        <h2 className="section-title">Form Components</h2>
        <div className="component-grid">
          <div className="component-demo">
            <h3>Input Fields</h3>
            <div className="input-showcase">
              <Input
                label="Text Input"
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Email Input"
                type="email"
                placeholder="user@example.com"
              />
              <Input
                label="Password Input"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Input with Error"
                error="This field is required"
                placeholder="This has an error"
              />
            </div>
          </div>

          <div className="component-demo">
            <h3>Textarea & Select</h3>
            <div className="input-showcase">
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-medium)' }}>
                  Textarea
                </label>
                <textarea
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-muted)40',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-content)',
                    resize: 'vertical'
                  }}
                  placeholder="Enter your message..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-medium)' }}>
                  Select
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-muted)40',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-content)'
                  }}
                >
                  <option>Choose an option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Components */}
      <div className="demo-section">
        <h2 className="section-title">Card Components</h2>
        <div className="component-grid">
          <div className="component-demo">
            <h3>Basic Cards</h3>
            <div className="card-showcase">
              <Card>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0' }}>Simple Card</h4>
                  <p style={{ margin: 0, color: 'var(--color-muted)' }}>
                    A basic card with content and padding.
                  </p>
                </div>
              </Card>

              <Card interactive>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0' }}>Interactive Card</h4>
                  <p style={{ margin: 0, color: 'var(--color-muted)' }}>
                    This card responds to hover and click interactions.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div className="component-demo">
            <h3>Status Cards</h3>
            <div className="card-showcase">
              <Card variant="success">
                <div style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0' }}>✅ Success</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                    Operation completed successfully.
                  </p>
                </div>
              </Card>

              <Card variant="warning">
                <div style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0' }}>⚠️ Warning</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                    Please review this information.
                  </p>
                </div>
              </Card>

              <Card variant="error">
                <div style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0' }}>❌ Error</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                    Something went wrong.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Loading */}
      <div className="demo-section">
        <h2 className="section-title">Progress & Loading</h2>
        <div className="component-grid">
          <div className="component-demo">
            <h3>Progress Bars</h3>
            <div className="progress-showcase">
              <div>
                <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  Default Progress: {progress}%
                </div>
                <Progress value={progress} />
              </div>
              <div>
                <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  Success Progress
                </div>
                <Progress value={85} variant="success" />
              </div>
              <div>
                <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  Warning Progress
                </div>
                <Progress value={45} variant="warning" />
              </div>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="component-demo">
            <h3>Loading States</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
              <OutlineButton onClick={handleLoadingTest} disabled={loading}>
                {loading ? <Spinner size="sm" style={{ marginRight: 'var(--space-2)' }} /> : null}
                {loading ? 'Testing...' : 'Test Loading State'}
              </OutlineButton>
            </div>
          </div>
        </div>
      </div>

      {/* Modal & Interactions */}
      <div className="demo-section">
        <h2 className="section-title">Modals & Interactions</h2>
        <div className="component-demo">
          <div style={{ textAlign: 'center' }}>
            <PrimaryButton onClick={() => setShowModal(true)}>
              Open Modal Demo
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="demo-section">
        <h2 className="section-title">Accessibility Features</h2>
        <div className="accessibility-demo">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-2) 0' }}>WCAG 2.1 AA Compliant</h3>
            <p style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-muted)' }}>
              All components include comprehensive accessibility features
            </p>
            <OutlineButton onClick={handleAccessibilityTest}>
              Test Screen Reader Announcement
            </OutlineButton>
          </div>

          <div className="accessibility-features">
            <div className="feature-item">
              <span className="feature-icon">⌨️</span>
              <p className="feature-text">Full keyboard navigation</p>
              <div className="status-indicator"></div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👁️</span>
              <p className="feature-text">Screen reader support</p>
              <div className="status-indicator"></div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <p className="feature-text">Enhanced focus indicators</p>
              <div className="status-indicator"></div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌈</span>
              <p className="feature-text">High contrast mode</p>
              <div className="status-indicator"></div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👆</span>
              <p className="feature-text">Touch-friendly targets</p>
              <div className="status-indicator"></div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <p className="feature-text">Reduced motion support</p>
              <div className="status-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Design System Demo"
        size="md"
      >
        <div style={{ padding: 'var(--space-4)' }}>
          <p style={{ margin: '0 0 var(--space-4) 0' }}>
            This modal demonstrates the Nova Universe design system's modal component with:
          </p>
          <ul style={{ margin: '0 0 var(--space-4) 0', paddingLeft: 'var(--space-6)' }}>
            <li>Focus trap and keyboard navigation</li>
            <li>Escape key to close</li>
            <li>Backdrop click handling</li>
            <li>Proper ARIA attributes</li>
            <li>Responsive sizing</li>
          </ul>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <OutlineButton onClick={() => setShowModal(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={() => setShowModal(false)}>
              Confirm
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function _DesignSystemDemo() {
  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <div className="demo-page" id="main-content">
          {/* Header */}
          <div className="demo-header">
            <h1 className="demo-title">Nova Universe Design System</h1>
            <p className="demo-subtitle">Phase 3 Implementation - Complete Component Library</p>
          </div>

          {/* Theme Controls */}
          <div className="demo-controls">
            <ThemeControls />
          </div>

          {/* Component Showcase */}
          <ComponentShowcase />
        </div>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}
