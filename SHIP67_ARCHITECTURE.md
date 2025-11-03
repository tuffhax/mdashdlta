# Ship 67 Communications Architecture Documentation

## Overview
Ship 67 Communications enables direct crew-to-crew communication between the Martian habitat and the orbiting Ship 67. Using Gemini AI, it simulates real-time messaging with fellow astronauts aboard the ship, providing mission coordination, support, and information exchange.

## Architecture Components

### 1. SHIP67_CONFIG
Central configuration object containing:
- `apiEndpoint`: URL for Gemini 2.0 Flash API
- `timeout`: Request timeout in milliseconds
- `maxTokens`: Maximum response tokens

### 2. ship67State
Global state management:
- `apiKey`: User's Gemini API key (stored in localStorage)
- `chatHistory`: Array of conversation entries
- `theme`: UI theme preference

### 3. ship67Toast
Notification system for user feedback:
- Displays temporary messages
- Supports different types (info, error)
- Uses CSS animations for smooth appearance/disappearance

### 4. sendShip67Message()
Core communication function:
- Validates API key presence
- Formats messages for Gemini API with crew member persona
- Handles API requests and responses
- Manages error states
- Updates chat history

## Implementation Details

### API Integration
- Uses Google Gemini 2.0 Flash API
- Gemini acts as a crew member on Ship 67
- Implements proper error handling and timeouts
- Maintains conversation context through chat history

### Data Persistence
- API key stored securely in localStorage
- Chat history persisted across sessions
- Theme preferences saved

### UI Integration
- Seamless integration with main dashboard
- Consistent styling with glass-morphism theme
- Real-time chat updates with timestamps

## Security Considerations
- API key required for functionality
- No sensitive data transmitted
- Local storage used for non-sensitive preferences

## Future Enhancements
- Voice synthesis integration
- Advanced conversation memory
- Multi-language support
- Integration with habitat systems for real-time data sharing