// Package novauniverse provides a Go client for the Nova Universe Platform API V1
package novauniverse

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// Client is the Nova Universe API client
type Client struct {
	BaseURL    string
	APIVersion string
	AuthToken  string
	HTTPClient *http.Client
}

// ClientConfig holds configuration for the Nova Universe client
type ClientConfig struct {
	BaseURL    string
	APIKey     string
	APIVersion string
	Timeout    time.Duration
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken,omitempty"`
	User         User   `json:"user"`
	ExpiresIn    int    `json:"expiresIn,omitempty"`
}

// User represents a user in the system
type User struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	Role      string `json:"role,omitempty"`
}

// Ticket represents a support ticket
type Ticket struct {
	ID             int    `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Status         string `json:"status"`
	Priority       string `json:"priority"`
	Category       string `json:"category,omitempty"`
	RequesterEmail string `json:"requester_email,omitempty"`
	AssignedTo     int    `json:"assigned_to,omitempty"`
	CreatedAt      string `json:"created_at,omitempty"`
	UpdatedAt      string `json:"updated_at,omitempty"`
}

// Asset represents an IT asset
type Asset struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Type         string `json:"type"`
	SerialNumber string `json:"serial_number,omitempty"`
	Location     string `json:"location,omitempty"`
	AssignedTo   string `json:"assigned_to,omitempty"`
	Status       string `json:"status,omitempty"`
}

// ListParams holds pagination parameters
type ListParams struct {
	Page  int    `url:"page,omitempty"`
	Limit int    `url:"limit,omitempty"`
	Sort  string `url:"sort,omitempty"`
	Order string `url:"order,omitempty"`
}

// TicketListParams holds ticket list parameters
type TicketListParams struct {
	ListParams
	Status   string `url:"status,omitempty"`
	Priority string `url:"priority,omitempty"`
	Search   string `url:"search,omitempty"`
}

// Custom errors
type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API error (%d): %s", e.StatusCode, e.Message)
}

// NewClient creates a new Nova Universe API client
func NewClient(config *ClientConfig) *Client {
	if config == nil {
		config = &ClientConfig{}
	}

	if config.BaseURL == "" {
		config.BaseURL = "http://localhost:3000"
	}

	if config.APIVersion == "" {
		config.APIVersion = "v1"
	}

	timeout := config.Timeout
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	client := &Client{
		BaseURL:    config.BaseURL,
		APIVersion: config.APIVersion,
		AuthToken:  config.APIKey,
		HTTPClient: &http.Client{
			Timeout: timeout,
		},
	}

	return client
}

// Authenticate authenticates with username and password
func (c *Client) Authenticate(username, password string) (*AuthResponse, error) {
	data := map[string]string{
		"username": username,
		"password": password,
	}

	var authResp AuthResponse
	err := c.doRequest("POST", "/auth/login", data, nil, &authResp, true)
	if err != nil {
		return nil, err
	}

	c.AuthToken = authResp.Token
	return &authResp, nil
}

// doRequest performs an HTTP request
func (c *Client) doRequest(method, endpoint string, body interface{}, params interface{}, result interface{}, skipAuth bool) error {
	u := fmt.Sprintf("%s/api/%s%s", c.BaseURL, c.APIVersion, endpoint)

	// Add query parameters
	if params != nil {
		values, err := toURLValues(params)
		if err != nil {
			return err
		}
		if len(values) > 0 {
			u = fmt.Sprintf("%s?%s", u, values.Encode())
		}
	}

	var bodyReader io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return err
		}
		bodyReader = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, u, bodyReader)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "nova-universe-go-sdk/1.0.0")

	if !skipAuth && c.AuthToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.AuthToken))
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		return &APIError{
			StatusCode: resp.StatusCode,
			Message:    string(responseBody),
		}
	}

	if result != nil && len(responseBody) > 0 {
		if err := json.Unmarshal(responseBody, result); err != nil {
			return err
		}
	}

	return nil
}

// toURLValues converts a struct to url.Values
func toURLValues(params interface{}) (url.Values, error) {
	values := url.Values{}
	
	if params == nil {
		return values, nil
	}

	data, err := json.Marshal(params)
	if err != nil {
		return values, err
	}

	var m map[string]interface{}
	if err := json.Unmarshal(data, &m); err != nil {
		return values, err
	}

	for k, v := range m {
		if v != nil {
			values.Add(k, fmt.Sprintf("%v", v))
		}
	}

	return values, nil
}

// Tickets API

// ListTickets lists tickets with optional filters
func (c *Client) ListTickets(params *TicketListParams) ([]Ticket, error) {
	var tickets []Ticket
	err := c.doRequest("GET", "/tickets", nil, params, &tickets, false)
	return tickets, err
}

// GetTicket gets a ticket by ID
func (c *Client) GetTicket(ticketID int) (*Ticket, error) {
	var ticket Ticket
	endpoint := fmt.Sprintf("/tickets/%d", ticketID)
	err := c.doRequest("GET", endpoint, nil, nil, &ticket, false)
	return &ticket, err
}

// CreateTicket creates a new ticket
func (c *Client) CreateTicket(ticket *Ticket) (*Ticket, error) {
	var createdTicket Ticket
	err := c.doRequest("POST", "/tickets", ticket, nil, &createdTicket, false)
	return &createdTicket, err
}

// UpdateTicket updates a ticket
func (c *Client) UpdateTicket(ticketID int, updates map[string]interface{}) (*Ticket, error) {
	var updatedTicket Ticket
	endpoint := fmt.Sprintf("/tickets/%d", ticketID)
	err := c.doRequest("PATCH", endpoint, updates, nil, &updatedTicket, false)
	return &updatedTicket, err
}

// DeleteTicket deletes a ticket
func (c *Client) DeleteTicket(ticketID int) error {
	endpoint := fmt.Sprintf("/tickets/%d", ticketID)
	return c.doRequest("DELETE", endpoint, nil, nil, nil, false)
}

// AddTicketComment adds a comment to a ticket
func (c *Client) AddTicketComment(ticketID int, content string, isPublic bool) (map[string]interface{}, error) {
	data := map[string]interface{}{
		"content":   content,
		"is_public": isPublic,
	}

	var result map[string]interface{}
	endpoint := fmt.Sprintf("/tickets/%d/comments", ticketID)
	err := c.doRequest("POST", endpoint, data, nil, &result, false)
	return result, err
}

// Assets API

// ListAssets lists assets
func (c *Client) ListAssets(params *ListParams) ([]Asset, error) {
	var assets []Asset
	err := c.doRequest("GET", "/assets", nil, params, &assets, false)
	return assets, err
}

// GetAsset gets an asset by ID
func (c *Client) GetAsset(assetID int) (*Asset, error) {
	var asset Asset
	endpoint := fmt.Sprintf("/assets/%d", assetID)
	err := c.doRequest("GET", endpoint, nil, nil, &asset, false)
	return &asset, err
}

// CreateAsset creates a new asset
func (c *Client) CreateAsset(asset *Asset) (*Asset, error) {
	var createdAsset Asset
	err := c.doRequest("POST", "/assets", asset, nil, &createdAsset, false)
	return &createdAsset, err
}

// UpdateAsset updates an asset
func (c *Client) UpdateAsset(assetID int, updates map[string]interface{}) (*Asset, error) {
	var updatedAsset Asset
	endpoint := fmt.Sprintf("/assets/%d", assetID)
	err := c.doRequest("PATCH", endpoint, updates, nil, &updatedAsset, false)
	return &updatedAsset, err
}

// Users API

// ListUsers lists directory users
func (c *Client) ListUsers(params *ListParams) ([]User, error) {
	var users []User
	err := c.doRequest("GET", "/directory", nil, params, &users, false)
	return users, err
}

// GetUser gets a user by ID
func (c *Client) GetUser(userID int) (*User, error) {
	var user User
	endpoint := fmt.Sprintf("/directory/%d", userID)
	err := c.doRequest("GET", endpoint, nil, nil, &user, false)
	return &user, err
}

// SyncDirectory triggers directory synchronization
func (c *Client) SyncDirectory() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("POST", "/directory/sync", nil, nil, &result, false)
	return result, err
}

// Monitoring API

// GetMonitoringDashboard gets the monitoring dashboard
func (c *Client) GetMonitoringDashboard() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("GET", "/monitoring", nil, nil, &result, false)
	return result, err
}

// GetSystemHealth gets system health status
func (c *Client) GetSystemHealth() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("GET", "/monitoring/health", nil, nil, &result, false)
	return result, err
}

// ListAlerts lists alerts
func (c *Client) ListAlerts(status string) ([]map[string]interface{}, error) {
	params := map[string]string{}
	if status != "" {
		params["status"] = status
	}

	var alerts []map[string]interface{}
	err := c.doRequest("GET", "/alerts", nil, params, &alerts, false)
	return alerts, err
}

// CreateAlert creates an alert
func (c *Client) CreateAlert(alert map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("POST", "/alerts", alert, nil, &result, false)
	return result, err
}

// AcknowledgeAlert acknowledges an alert
func (c *Client) AcknowledgeAlert(alertID int) (map[string]interface{}, error) {
	data := map[string]string{"status": "acknowledged"}
	var result map[string]interface{}
	endpoint := fmt.Sprintf("/alerts/%d", alertID)
	err := c.doRequest("PATCH", endpoint, data, nil, &result, false)
	return result, err
}

// Workflows API

// ListWorkflows lists workflows
func (c *Client) ListWorkflows() ([]map[string]interface{}, error) {
	var workflows []map[string]interface{}
	err := c.doRequest("GET", "/workflows", nil, nil, &workflows, false)
	return workflows, err
}

// GetWorkflow gets a workflow by ID
func (c *Client) GetWorkflow(workflowID int) (map[string]interface{}, error) {
	var workflow map[string]interface{}
	endpoint := fmt.Sprintf("/workflows/%d", workflowID)
	err := c.doRequest("GET", endpoint, nil, nil, &workflow, false)
	return workflow, err
}

// CreateWorkflow creates a workflow
func (c *Client) CreateWorkflow(workflow map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("POST", "/workflows", workflow, nil, &result, false)
	return result, err
}

// Analytics API

// GetAnalyticsDashboard gets the analytics dashboard
func (c *Client) GetAnalyticsDashboard() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.doRequest("GET", "/analytics", nil, nil, &result, false)
	return result, err
}

// GetTicketMetrics gets ticket metrics
func (c *Client) GetTicketMetrics(period string) (map[string]interface{}, error) {
	params := map[string]string{"period": period}
	var result map[string]interface{}
	err := c.doRequest("GET", "/analytics/tickets", nil, params, &result, false)
	return result, err
}
