# Nova Universe Go SDK

Official Go client library for the Nova Universe Platform API V1.

## Installation

```bash
go get github.com/itristenx/nova-universe/sdk/go/novauniverse
```

## Quick Start

```go
package main

import (
	"fmt"
	"log"

	"github.com/itristenx/nova-universe/sdk/go/novauniverse"
)

func main() {
	// Initialize client
	client := novauniverse.NewClient(&novauniverse.ClientConfig{
		BaseURL: "http://localhost:3000",
	})

	// Authenticate
	authResp, err := client.Authenticate("admin@example.com", "admin")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Authenticated as %s\n", authResp.User.Email)

	// List tickets
	tickets, err := client.ListTickets(&novauniverse.TicketListParams{
		ListParams: novauniverse.ListParams{
			Limit: 50,
		},
		Status: "open",
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Found %d open tickets\n", len(tickets))

	// Create a ticket
	newTicket, err := client.CreateTicket(&novauniverse.Ticket{
		Title:       "Network connectivity issue",
		Description: "Cannot access shared network drive",
		Priority:    "high",
		Category:    "network",
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Created ticket #%d\n", newTicket.ID)
}
```

## Usage

### Authentication

#### Username/Password Authentication

```go
client := novauniverse.NewClient(&novauniverse.ClientConfig{
	BaseURL: "http://localhost:3000",
})

authResp, err := client.Authenticate("admin@example.com", "admin")
if err != nil {
	log.Fatal(err)
}

fmt.Printf("Token: %s\n", authResp.Token)
```

#### API Key Authentication

```go
client := novauniverse.NewClient(&novauniverse.ClientConfig{
	BaseURL: "http://localhost:3000",
	APIKey:  "your-api-key-here",
})

// Already authenticated, can make requests immediately
tickets, err := client.ListTickets(nil)
```

### Tickets

```go
// List tickets with filters
tickets, err := client.ListTickets(&novauniverse.TicketListParams{
	ListParams: novauniverse.ListParams{
		Page:  1,
		Limit: 50,
		Sort:  "priority",
		Order: "desc",
	},
	Status:   "open",
	Priority: "high",
	Search:   "network",
})
if err != nil {
	log.Fatal(err)
}

// Get specific ticket
ticket, err := client.GetTicket(123)
if err != nil {
	log.Fatal(err)
}

// Create ticket
newTicket, err := client.CreateTicket(&novauniverse.Ticket{
	Title:          "Printer not working",
	Description:    "Office printer on 3rd floor is offline",
	Priority:       "medium",
	Category:       "hardware",
	RequesterEmail: "user@example.com",
})
if err != nil {
	log.Fatal(err)
}

// Update ticket
updated, err := client.UpdateTicket(123, map[string]interface{}{
	"status":      "in_progress",
	"priority":    "urgent",
	"assigned_to": 5,
})
if err != nil {
	log.Fatal(err)
}

// Add comment
comment, err := client.AddTicketComment(
	123,
	"Investigating the issue",
	false, // isPublic
)
if err != nil {
	log.Fatal(err)
}

// Delete ticket
err = client.DeleteTicket(123)
if err != nil {
	log.Fatal(err)
}
```

### Assets

```go
// List assets
assets, err := client.ListAssets(&novauniverse.ListParams{
	Page:  1,
	Limit: 50,
})
if err != nil {
	log.Fatal(err)
}

// Get specific asset
asset, err := client.GetAsset(456)
if err != nil {
	log.Fatal(err)
}

// Create asset
newAsset, err := client.CreateAsset(&novauniverse.Asset{
	Name:         "LAPTOP-001",
	Type:         "laptop",
	SerialNumber: "SN123456789",
	Location:     "Office - Floor 3",
	AssignedTo:   "user@example.com",
})
if err != nil {
	log.Fatal(err)
}

// Update asset
updatedAsset, err := client.UpdateAsset(456, map[string]interface{}{
	"location": "Office - Floor 2",
	"status":   "active",
})
if err != nil {
	log.Fatal(err)
}
```

### Users & Directory

```go
// List users
users, err := client.ListUsers(&novauniverse.ListParams{
	Page:  1,
	Limit: 50,
})
if err != nil {
	log.Fatal(err)
}

// Get specific user
user, err := client.GetUser(789)
if err != nil {
	log.Fatal(err)
}

// Trigger directory sync
syncResult, err := client.SyncDirectory()
if err != nil {
	log.Fatal(err)
}
```

### Monitoring & Alerts

```go
// Get monitoring dashboard
dashboard, err := client.GetMonitoringDashboard()
if err != nil {
	log.Fatal(err)
}

// Get system health
health, err := client.GetSystemHealth()
if err != nil {
	log.Fatal(err)
}
fmt.Printf("System status: %v\n", health["status"])

// List alerts
alerts, err := client.ListAlerts("active")
if err != nil {
	log.Fatal(err)
}

// Create alert
alert, err := client.CreateAlert(map[string]interface{}{
	"title":       "High CPU Usage",
	"severity":    "warning",
	"source":      "monitoring-system",
	"description": "CPU usage above 80%",
})
if err != nil {
	log.Fatal(err)
}

// Acknowledge alert
err = client.AcknowledgeAlert(123)
if err != nil {
	log.Fatal(err)
}
```

### Workflows

```go
// List workflows
workflows, err := client.ListWorkflows()
if err != nil {
	log.Fatal(err)
}

// Get specific workflow
workflow, err := client.GetWorkflow(1)
if err != nil {
	log.Fatal(err)
}

// Create workflow
newWorkflow, err := client.CreateWorkflow(map[string]interface{}{
	"name":        "Approval Workflow",
	"description": "Standard approval process",
	"steps": []map[string]interface{}{
		{
			"type":      "approval",
			"approvers": []string{"manager@example.com"},
		},
	},
})
if err != nil {
	log.Fatal(err)
}
```

### Analytics

```go
// Get analytics dashboard
analytics, err := client.GetAnalyticsDashboard()
if err != nil {
	log.Fatal(err)
}

// Get ticket metrics
metrics, err := client.GetTicketMetrics("7d")
if err != nil {
	log.Fatal(err)
}
fmt.Printf("Total tickets this week: %v\n", metrics["total"])
```

## Error Handling

The SDK returns typed errors that can be checked:

```go
ticket, err := client.GetTicket(99999)
if err != nil {
	if apiErr, ok := err.(*novauniverse.APIError); ok {
		switch apiErr.StatusCode {
		case 401:
			fmt.Println("Authentication failed")
		case 404:
			fmt.Println("Ticket not found")
		case 422:
			fmt.Println("Validation error:", apiErr.Message)
		case 429:
			fmt.Println("Rate limit exceeded")
		default:
			fmt.Printf("API error (%d): %s\n", apiErr.StatusCode, apiErr.Message)
		}
	} else {
		fmt.Println("Network error:", err)
	}
}
```

## Advanced Configuration

```go
import "time"

client := novauniverse.NewClient(&novauniverse.ClientConfig{
	BaseURL:    "https://api.nova-universe.com",
	APIVersion: "v1",                // API version (default: "v1")
	Timeout:    60 * time.Second,    // Request timeout (default: 30s)
	APIKey:     "your-api-key",
})
```

## Development

### Running Tests

```bash
go test ./...
```

### Building

```bash
go build ./...
```

### Code Formatting

```bash
go fmt ./...
```

## Examples

See the `examples/` directory for more usage examples:

- `examples/basic_usage.go` - Basic ticket operations
- `examples/monitoring.go` - Monitoring and alerts
- `examples/workflows.go` - Workflow automation
- `examples/error_handling.go` - Error handling patterns

## Features

- **Zero Dependencies**: Uses only the Go standard library
- **Type Safety**: Strongly typed structs for all resources
- **Error Handling**: Typed errors with status codes
- **Timeouts**: Configurable request timeouts
- **Pagination**: Built-in pagination support
- **Clean API**: Idiomatic Go interfaces

## API Documentation

For complete API documentation, visit:
- Local: http://localhost:3000/api-docs
- Production: https://api.nova-universe.com/api-docs

## Rate Limiting

The API implements rate limiting:
- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

The SDK does not automatically handle rate limiting. Implement retry logic in your application as needed.

## Support

- **Documentation**: https://docs.nova-universe.com
- **GitHub Issues**: https://github.com/itristenx/nova-universe/issues
- **Email**: api-support@nova-universe.com

## License

MIT License - See LICENSE file for details

## Changelog

### v1.0.0 (2025-10-05)
- Initial release
- Support for V1 API endpoints
- Zero external dependencies
- Resources: Tickets, Assets, Users, Monitoring, Workflows, Analytics
- Authentication with username/password or API key
- Comprehensive error handling with typed errors
- Full test coverage
