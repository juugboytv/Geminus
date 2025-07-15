# Geminus - Dark Fantasy RPG Analysis

## Overview
Geminus is a web-based dark fantasy RPG built as a single-page application. It combines real-time multiplayer chat, zone-based exploration, and RPG progression mechanics in a browser environment.

## Technology Stack

### Frontend
- **HTML5 Canvas** - For map rendering and zone visualization
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Custom CSS Variables** - Dark theme with cyan/teal accent colors
- **Google Fonts** - Multiple font families (Cinzel, Inter, Uncial Antiqua, etc.)

### Backend Services
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - User authentication (anonymous + custom tokens)
- **Firebase Storage** - Avatar image storage
- **Imagen 3.0 API** - AI-generated zone backgrounds

## Core Architecture

### State Management
- Centralized `state` object managing user profile, current view, and listeners
- Real-time synchronization with Firebase Firestore
- Event-driven architecture with snapshot listeners

### Game Systems

#### 1. Map & Zone System
- **World Map**: Square grid-based with 50 predefined zones
- **Zone Maps**: Hexagonal grid-based with procedurally generated layouts
- **Grid Utilities**: Mathematical functions for hex/square coordinate conversion
- **Biome System**: 8 different biomes (mountain, forest, swamp, etc.)

#### 2. Movement System
- **D-Pad Controls**: 4-directional movement (N, S, E, W mapped to NW, SE, E, W)
- **Click Navigation**: Direct movement by clicking on map tiles
- **Grid Validation**: Obstacle detection and boundary checking
- **Teleportation**: Quick travel between unlocked zones

#### 3. Chat & Social Features
- **Multi-Channel Chat**: Main, Sales, Clan channels
- **Private Messaging**: Direct user-to-user communication
- **Real-time Presence**: Online user tracking per room
- **Message Features**: Replies, deletion (with role permissions)
- **Role System**: Leader, Co-leader, Member hierarchy

#### 4. RPG Progression
- **Level System**: Character progression with level requirements
- **Currency System**: Gold and Kill Points (KP)
- **Auction Tokens**: Premium currency for auction house
- **Zone Unlocking**: Level-gated content access

## Key Features

### Zone Buildings & Interactions
- **Blacksmith**: Buy/Sell/Craft equipment
- **Arcanum**: Magic items and enchantments  
- **Bank**: Financial transactions
- **Estate**: Player housing
- **Portal**: Fast travel between zones
- **Exit**: Return to world map

### User Interface Components
- **Glassmorphism Design**: Translucent panels with backdrop blur
- **Mini-Map**: Real-time position indicator
- **Progress Bars**: HP, XP, and resource tracking
- **Modal System**: Overlays for chat, profiles, and interactions
- **Toast Notifications**: Success/error feedback
- **Responsive Layout**: Mobile-optimized with max-width constraints

### Real-time Features
- **Live Chat**: Instant message delivery via Firestore
- **Presence System**: User online/offline status
- **Profile Sync**: Real-time stat updates
- **Position Tracking**: Persistent player location

## Technical Implementation Details

### Firebase Integration
```javascript
// Firestore paths structure
/artifacts/{appId}/public/data/
  ├── rooms/{roomId}/messages
  ├── rooms/{roomId}/onlineUsers  
  ├── profiles/{userId}
  ├── pms/{conversationId}/messages
  └── clan_messages
```

### Canvas Rendering
- **World Map**: 32px square grid with image-based terrain
- **Zone View**: Variable-size hexagonal grid with dynamic layouts
- **Mini-Map**: Circular viewport showing local area
- **Smooth Animations**: RequestAnimationFrame-based updates

### Game Data Structure
- **50 Predefined Zones**: Each with name, level requirement, and biome
- **Procedural Generation**: Random obstacle and building placement
- **Persistent State**: Player positions saved across sessions
- **Biome-specific Content**: Themed obstacles and aesthetics

### Performance Optimizations
- **Event Debouncing**: Firestore listener management
- **Canvas Optimization**: Efficient redraw cycles
- **Memory Management**: Proper cleanup of event listeners
- **Image Caching**: Background image preloading

## Security & Data Flow
- **Anonymous Authentication**: Quick user onboarding
- **Role-based Permissions**: Content access control
- **Real-time Validation**: Server-side rule enforcement
- **Sanitized Inputs**: XSS prevention in chat messages

## Development Features
- **Dev Tools Panel**: Simulate kills, level gains, token purchases
- **Debug Logging**: Console output for development
- **Hot Configuration**: Firebase config injection
- **Error Handling**: Graceful fallbacks for failed operations

## Scalability Considerations
- **Modular Architecture**: Separate managers for different systems
- **Efficient Queries**: Firestore query optimization
- **Asset Management**: CDN-hosted external resources
- **State Persistence**: User data preservation across sessions

## Future Enhancement Opportunities
1. **Combat System**: Turn-based or real-time battle mechanics
2. **Equipment System**: Item stats and visual representation
3. **Guild Features**: Advanced clan management tools
4. **Auction House**: Player-to-player trading
5. **Quest System**: Structured gameplay objectives
6. **Sound Integration**: Audio feedback and ambient music
7. **Mobile App**: Native mobile client
8. **Performance Metrics**: Analytics and monitoring