# Product Requirements Document: DinDin

## 1. Problem Statement

The daily hassle of deciding what to eat can be a significant pain point for couples and
individuals. The current process often involves endless browsing through recipe websites, food
blogs, or social media, leading to decision fatigue and frustration. DinDin aims to solve this
problem by providing a simple and engaging platform for users to discover and match with their
preferred dinner options. By leveraging a Tinder-like card swiping interface, DinDin streamlines the
decision-making process, allowing users to quickly and easily find a match and decide on dinner
plans. This problem is important to solve now, as the rise of food delivery and online ordering has
increased the demand for convenient and personalized dining experiences.

## 2. Product Vision

The long-term vision for DinDin is to become the go-to platform for social dining and meal planning.
Beyond its MVP, DinDin aims to expand its features to include personalized recipe recommendations,
social sharing, and integration with popular food delivery services. The app may also evolve to
accommodate larger groups, events, and special occasions. As the app grows, it will continue to
prioritize user engagement, retention, and satisfaction, ensuring that DinDin remains a valuable and
enjoyable experience for its users. Ultimately, DinDin envisions a future where mealtime is no
longer a source of stress, but a opportunity for connection and enjoyment.

## 3. Target Users

### Persona 1: Alex, the Busy Professional

- Name: Alex
- Role: Marketing Manager
- Demographics: 28-35 years old, urban, working professionals
- Key needs and motivations: Quick and easy meal solutions, wants to impress partner with dinner
  plans
- Challenges: Limited time for cooking, wants to avoid repetitive meals
- How DinDin helps: Provides a fast and fun way to discover new recipes and match with partner

### Persona 2: Maya, the Home Cook

- Name: Maya
- Role: Teacher
- Demographics: 25-40 years old, suburban, food enthusiasts
- Key needs and motivations: Variety of recipes, wants to cook healthy meals for partner and family
- Challenges: Limited cooking inspiration, wants to avoid boring meals
- How DinDin helps: Offers a curated selection of recipes, allows for easy meal planning and
  discovery

### Persona 3: Jamie, the Foodie

- Name: Jamie
- Role: Freelancer
- Demographics: 25-40 years old, urban, foodies
- Key needs and motivations: Unique and exciting recipes, wants to try new foods and restaurants
- Challenges: Limited time for cooking, wants to stay up-to-date on food trends
- How DinDin helps: Provides access to a diverse library of recipes, allows for social sharing and
  discovery

## 4. Use Cases

### Use Case 1: Couples Matching

- Trigger: Two users, Alex and Maya, sign up for DinDin and start swiping through recipes
- Steps: Alex and Maya swipe through recipes, both swiping right on a chicken parmesan recipe
- Outcome: Alex and Maya are matched, and the app suggests they cook chicken parmesan for dinner

### Use Case 2: Solo Meal Planning

- Trigger: Jamie signs up for DinDin and wants to find a new recipe to try
- Steps: Jamie swipes through recipes, favoriting a few options
- Outcome: Jamie receives a list of recommended recipes, with cooking instructions and nutritional
  information

### Use Case 3: Social Sharing

- Trigger: Alex and Maya cook a matched recipe and want to share their experience
- Steps: Alex and Maya upload photos and reviews of their meal
- Outcome: Their friends and followers on social media can see their posts, with links to the recipe
  and DinDin

## 5. Key Features

### Feature 1: Recipe Swiping

- **Feature Name:** Recipe Swiping
- **Detailed Description:** Users swipe through a curated selection of recipes, with the option to
  like or dislike each one. Similar to Tinder!
- **Purpose:** Provides a fun and engaging way for users to discover new recipes and match with
  their partner
- **Dependencies/Assumptions:** Recipe data, user profiles, and swiping algorithm

### Feature 2: Peer-to-Peer Matching

- **Feature Name:** Peer-to-Peer Matching
- **Detailed Description:** Users can match with their partner or friends on recipes, creating a
  shared dinner plan
- **Purpose:** Facilitates social dining and meal planning, allowing users to connect with others
  over food
- **Dependencies/Assumptions:** User profiles, recipe data, and matching algorithm

### Feature 3: Recipe Library

- **Feature Name:** Recipe Library
- **Detailed Description:** A comprehensive library of recipes, with filtering and search
  capabilities
- **Purpose:** Provides users with a wide range of recipe options, catering to different tastes and
  dietary needs
- **Dependencies/Assumptions:** Recipe data, filtering and search algorithms

### Feature 4: Social Sharing

- **Feature Name:** Social Sharing
- **Detailed Description:** Users can share their cooking experiences and photos on social media
- **Purpose:** Encourages user engagement and retention, allowing users to share their love of food
  with others
- **Dependencies/Assumptions:** Social media APIs, user profiles

## 6. Non-Functional Requirements

- **App Performance and Responsiveness:** DinDin should provide a seamless and responsive user
  experience, with fast loading times and smooth navigation
- **Cross-Platform Behavior:** DinDin should behave consistently across iOS, Android, and Web
  platforms
- **Accessibility and Inclusivity:** DinDin should be accessible to users with disabilities, with
  features such as screen reader support and high contrast mode
- **Data Privacy and Security Standards:** DinDin should adhere to strict data protection and
  security standards, ensuring user data is safe and secure
- **Offline Access or Backup Requirements:** DinDin should provide offline access to recipe data,
  with automatic syncing when the user comes online

## 7. MVP Scope

The MVP will include the following features:

- Recipe Swiping
- Peer-to-Peer Matching
- Recipe Library
- User Profiles

These features were prioritized as they provide the core value proposition of DinDin, allowing users
to discover and match with recipes. The MVP will deliver a functional and engaging platform, with a
focus on user experience and retention.

## 8. Out-of-Scope

The following features are explicitly excluded from the MVP:

- Social Sharing
- Integration with food delivery services
- Personalized recipe recommendations

These features will be considered for future development, based on user feedback and market demand.

## 9. Success Metrics

The success of DinDin will be measured by the following metrics:

- User acquisition and retention rates
- Engagement metrics (e.g., swipes, matches, shares)
- User satisfaction ratings (e.g., app store reviews, surveys)

## 10. Risks & Assumptions

The following risks and assumptions have been identified:

- **Market Risk:** Competition from existing meal planning and social dining apps
- **Technical Risk:** Integration with recipe data sources and social media APIs
- **User Adoption:** User engagement and retention rates

By understanding these risks and assumptions, we can develop strategies to mitigate them and ensure
the success of DinDin.

# App Flow: DinDin

## 1. Entry Point

DinDin users can access the app through iOS, Android, and Web platforms. The onboarding process is
similar across platforms, with some adjustments for screen size and device capabilities.

- **Onboarding:** The app supports both guest access and authenticated login. For authenticated
  login, DinDin uses Google authentication.
- **Login/Signup Flow:** Users can sign up using their Google account. Guest users can start using
  the app immediately but will have limited access to features like saving preferences and
  connecting with other users.
- **Platform Differences:** While the core functionality remains the same, the app's layout and
  navigation are adapted for each platform. Mobile apps have a bottom tab bar, while the Web version
  uses a top navigation bar.

## 2. Global Navigation

The app features a simple and consistent navigation across all platforms.

- **Top Nav (Web):** A navigation bar at the top with links to main sections like "Discover,"
  "Matches," and "Profile."
- **Bottom Tab Bar (Mobile):** A tab bar at the bottom with icons for "Discover," "Matches,"
  "Profile," and "Settings."
- **Sidebar (None):** There's no sidebar; all navigation is through the top nav (Web) or bottom tab
  bar (Mobile).
- **Conditional Visibility:** Some features, like the "Matches" tab, are only visible to logged-in
  users.

## 3. Screens & Subflows

Here's a breakdown of the major screens and their functionalities:

### Screen: Welcome / Landing

- **Purpose:** Introduce the app, its benefits, and guide users to either log in or start as a
  guest.
- **Inputs & Controls:** None
- **Actions:** Navigate to login/signup or start as a guest
- **AI Enhancements:** None
- **Transitions:** To "Discover" screen for guests, or to "Profile" for logged-in users
- **Conditional Logic:** Display different content based on whether the user is accessing the app
  for the first time

### Screen: Discover

- **Purpose:** Display a card swiping interface with recipe options.
- **Inputs & Controls:** Swipe gestures (like/dislike), search bar
- **Actions:** Swipe through recipes, like or dislike them
- **AI Enhancements:** AI suggests recipes based on user preferences and swiping behavior
- **Transitions:** To "Match" screen when both users swipe right on the same recipe
- **Conditional Logic:** Recipes are filtered based on user preferences and previous interactions

### Screen: Match

- **Purpose:** Show matches (recipes liked by both users) and allow users to decide on dinner plans.
- **Inputs & Controls:** Buttons to confirm or cancel a match
- **Actions:** Confirm a match to decide on dinner, or cancel to continue swiping
- **AI Enhancements:** AI provides suggestions for planning dinner based on the matched recipe
- **Transitions:** Back to "Discover" or to "Chat" screen for discussing dinner plans
- **Conditional Logic:** Display matches based on both users' preferences and swiping history

### Screen: Profile

- **Purpose:** Allow users to view and edit their profile information.
- **Inputs & Controls:** Text inputs for profile details, image upload
- **Actions:** Edit profile, view preferences
- **AI Enhancements:** AI suggests profile improvements based on user behavior
- **Transitions:** Back to previous screen
- **Conditional Logic:** Display different profile information based on user settings

### Screen: Settings / Account

- **Purpose:** Allow users to manage their account settings and app preferences.
- **Inputs & Controls:** Toggle switches for settings, dropdowns for preferences
- **Actions:** Change settings, update preferences
- **AI Enhancements:** AI provides recommendations for optimizing settings based on user behavior
- **Transitions:** Back to previous screen
- **Conditional Logic:** Display settings based on user role (logged-in vs guest)

## 4. State Management & AI Logic

User data is saved locally on the device and synced with the server for logged-in users.
AI-generated inputs, such as recipe suggestions, are based on user preferences, swiping behavior,
and profile information.

- **Saved Locally:** User preferences, swiping history
- **Synced:** Profile information, matches, settings
- **AI Feedback Loops:** User interactions with AI suggestions update the AI model for better
  recommendations

## 5. Back Navigation Rules

Navigation is not strictly linear; users can move between screens freely, but with some limitations.

- **Back Button:** Takes users to the previous screen, with state preserved
- **Revisiting Steps:** Users can revisit previous steps, but some actions (like confirming a match)
  are irreversible

## 6. Responsive & Platform-Specific Behavior

The app adapts its layout and behavior for different platforms and screen sizes.

- **Layout Shifts:** The app uses responsive design to adjust layout for small vs large screens
- **Touch-Friendly Behaviors:** Mobile apps use touch-friendly gestures and scrolling rules
- **Sticky Buttons:** Mobile apps have sticky buttons and CTAs for easy access
- **Platform-Specific Features:** Use of device-specific features like camera and location services
  for enhanced user experience

# Tech Stack: DinDin

## 1. Frontend

- **Framework**: EXPO! Native for mobile (iOS, Android and Web) utilizing a Single Page
  Application (SPA) approach for a seamless user experience. This choice allows for code sharing
  between mobile and web platforms, reducing development time and costs.
- **IMPORTANT**:
  - Expo(react native) is already installed. In `src\frontend\**`
  - USE LINTER AND PRETTIER.
  - DO NOT USE `<ANY>` AS A TYPE
  - Use Jest or something comparable.
- **UI Styling System**: Utilize a modern design system with Tailwind CSS for styling, given its
  utility-first approach that aligns well with a modern and clean branding style. This will enable
  rapid development and a consistent design across the application.
- **Routing & Navigation**: Implement routing whatever is supported by latest Expo react native release.
  web, ensuring a smooth navigation experience between different sections of the app.
- **State Management**: Considering the app's moderate complexity, this is somehting we need to pay close attention too.
- **Component Structure**: Organize components into a modular structure, with a focus on
  reusability. This includes separate folders for shared components, screens, and navigation
  components.

## 2. Backend

- **Stack**: Node.js with Express.js for building a RESTful API, adopting a modular architecture to
  ensure scalability and maintainability. This stack is well-suited for handling a large number of
  recipe options and user interactions.
- **API Endpoints**: Define primary routes for user authentication, recipe management (CRUD
  operations), and match generation. Implement endpoints for:
  - User registration and login
  - Recipe listing, creation, and deletion
  - Match generation and retrieval
- **Security Middleware**: Implement token validation using JSON Web Tokens (JWT), rate limiting to
  prevent abuse, and logging for monitoring and debugging purposes.

## 3. LLM Integration

- **Provider**: No LLM integration is specified in the current requirements, but if future
  integrations are considered, a provider like Hugging Face or OpenAI could be evaluated.
- **Endpoints**: Not applicable at this stage.
- **Usage Logging**: Not applicable at this stage.

## 4. Database

- **Type**: MongoDB.
- The mongodb already exists and has been seeded with test data that matches the expected schema. Find json exports of the data `dindin.recipes.json` and `dindin-dev.users.json`
- **MONGO CONNECTION INFO**
- **uri**: MONGODB_URI=mongodb://localhost:27017/
- **database**: dindin
- **recipe collection name**: recipes
- **users collection name**: users
- **Schema Structure**:
  - **Recipe Schema**: Follow  `dindin.recipes.json`
  - **Users Schema**: Follow `dindin-dev.users.json`
  - Relationships: user_id foreign keys in matches and recipes

## 5. Authentication

- **Method**: Google Authentication for a seamless and secure login experience.
- **Token/Session Handling**: Use JSON Web Tokens (JWT) stored in local storage for client-side
  management.
- **Roles**: Implement basic roles (e.g., user, admin) if necessary for future feature expansions.

## 6. Hosting & Deployment

- **Platform**: Vercel for web hosting and AWS or Google Cloud for mobile backend hosting,
  considering their scalability and reliability.
- **CI/CD**: Utilize GitHub Actions for automated testing, building, and deployment.
- **Secrets Management**: Store sensitive keys and credentials securely using environment variables

## 7. Build System

- **Tool**: Webpack or Vite for frontend builds, and Node.js for backend builds.
- **Dev Experience**: Ensure fast reload and modular builds for efficient development.
- **Typing**: Use TypeScript for both frontend and backend to enforce type safety and improve
  developer experience.

## 8. External Integrations

- No external integrations are specified in the current requirements. However, potential
  integrations could include food delivery services, social media platforms, or recipe databases.

# Frontend Guidelines: DinDin

## 1. Design Philosophy

The DinDin application aims to provide a warm and inviting experience for couples or people eating
together. The design should evoke a sense of playfulness, comfort, and approachability. We strive
for a clean and simple visual impression, making it easy for users to navigate and enjoy the app.
The tone is friendly and engaging, with a touch of sophistication.

## 2. Color System

The primary brand colors for DinDin are:

- **Main Color**: `#F7F7F7` (a light, neutral gray)
- **Accent Color**: `#FFC700` (a vibrant, energetic orange-yellow)
- **Background Color**: `#FFFFFF` (white) for light mode, `#333333` (dark gray) for dark mode
- **Text Color**: `#333333` (dark gray) for light mode, `#FFFFFF` (white) for dark mode

Usage rules:

- **Main Color**: Use as the primary background color for the app.
- **Accent Color**: Use for call-to-actions (CTAs), highlights, and icons.
- **Background Color**: Use as the background color for the app, adjusting to dark mode when
  necessary.
- **Text Color**: Use for primary text content, adjusting to dark mode when necessary.

Contrast handling:

- Ensure a minimum contrast ratio of 4.5:1 for normal text and 7:1 for larger text (18pt and above).
- Use the **Accent Color** to provide visual interest and highlight important elements.

## 3. Typography

The preferred font for DinDin is **Open Sans**, a clean and modern sans-serif font.

Size hierarchy:

- **Small**: 12pt (used for captions and fine print)
- **Body**: 14pt (used for primary text content)
- **Heading**: 18pt (used for headings and titles)
- **Display**: 24pt (used for prominent displays and hero text)

Font weights:

- **Light**: 300 (used for subtle text and captions)
- **Regular**: 400 (used for primary text content)
- **Bold**: 600 (used for headings and emphasis)

Best practices:

- Use a line height of 1.5 to 2 times the font size.
- Ensure adequate spacing between elements (at least 16px).

## 4. Buttons

Button styles:

- **Primary**: Background color `#FFC700` (Accent Color), text color `#FFFFFF`, border radius 8px,
  padding 16px 32px, font weight 600.
- **Secondary**: Background color `#FFFFFF`, text color `#333333`, border radius 8px, padding 16px
  32px, font weight 400, border 1px solid `#333333`.
- **Tertiary**: Background color transparent, text color `#333333`, border radius 8px, padding 16px
  32px, font weight 400.

Hover and disabled states:

- **Hover**: Background color darkens by 10% for primary and secondary buttons.
- **Disabled**: Background color `#CCCCCC`, text color `#666666`, cursor not allowed.

## 5. Layout & Grid System

We will use a flex-based layout system.

- **Page padding**: 16px on all sides.
- **Section separation**: 32px between sections.
- **Breakpoints**:
  - **Desktop**: 1200px
  - **Tablet**: 768px
  - **Mobile**: 480px

Recommended layout structure:

- **Desktop**: A three-column layout with a navigation menu on the left, main content in the center,
  and a sidebar on the right.
- **Tablet**: A two-column layout with a navigation menu on the left and main content on the right.
- **Mobile**: A single-column layout with a navigation menu at the bottom.

## 6. Reusable Components

### Top Navigation

- **Height**: 64px
- **Background color**: `#F7F7F7` (Main Color)
- **Text color**: `#333333`
- **Font size**: 14pt

### Modals

- **Background color**: `#FFFFFF`
- **Text color**: `#333333`
- **Padding**: 32px
- **Border radius**: 8px

### Cards

- **Background color**: `#FFFFFF`
- **Text color**: `#333333`
- **Padding**: 16px
- **Border radius**: 8px
- **Shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)

### Stepper/Progress Tracker

- **Background color**: `#F7F7F7` (Main Color)
- **Text color**: `#333333`
- **Padding**: 16px
- **Border radius**: 8px

### Alerts and Toasts

- **Background color**: `#FFC700` (Accent Color)
- **Text color**: `#FFFFFF`
- **Padding**: 16px
- **Border radius**: 8px

## 7. Dark Mode Behavior

In dark mode:

- **Background color**: `#333333`
- **Text color**: `#FFFFFF`
- **Accent color**: `#FFC700` (no change)

Card styling and border visibility:

- **Background color**: `#444444`
- **Border**: 1px solid `#555555`

Button inversions:

- **Primary**: Background color `#FFFFFF`, text color `#333333`.
- **Secondary**: Background color `#444444`, text color `#FFFFFF`.

## 8. Theming & Customization Rules

Theming should work across different environments (user-selected themes, system default, brand
overrides).

Rules to keep UI consistent:

- Use a consistent color scheme across all themes.
- Ensure typography and layout are consistent across all themes.
- Allow for customization of accent colors and background colors.
- Provide a clear and consistent visual hierarchy across all themes.

By following these guidelines, we can ensure a consistent and scalable design system for DinDin.

# Backend Architecture: DinDin

## 1. System Overview

The backend system architecture for DinDin is designed to provide a scalable and efficient platform
for users to discover and match with their preferred dinner options. The system will utilize a
microservices architecture, with a focus on modularity and maintainability.

- **Authentication method:** Google authentication will be used, allowing users to sign in with
  their Google accounts.
- **Database type and organization:** MongoDb will be used as the primary database, with a schema
  designed to store user information, recipe data, and match history. The database will be organized
  into the following tables: Users, Recipes, Matches, and SwipeHistory.
- **API structure:** The API will be built using a RESTful architecture, with endpoints for user
  authentication, recipe retrieval, swiping, and match management.
- **LLM integration:** No LLM integration is planned for the initial release, but a placeholder has
  been reserved for future integration.
- **File storage:** No file storage is required for the initial release, but a cloud storage
  solution (e.g., AWS S3) may be used in the future to store user-generated content.
- **Patch/fix or context-aware workflows:** No patch/fix or context-aware workflows are planned for
  the initial release.

## 2. Database Schema (MongoDb)

The following tables will be used in the DinDin database:

### Users Table

- **Table name:** users
- **Key fields:**
  - id (serial primary key)
  - google_id (string)
  - name (string)
  - email (string)
- **Relationships and foreign keys:** None
- **Notes on indexes or special constraints:** A unique constraint will be placed on the google_id
  field to prevent duplicate user accounts.

### Recipes Table

- **Table name:** recipes
- **Key fields:**
  - id (serial primary key)
  - title (string)
  - description (string)
  - image_url (string)
  - ingredients (array of strings)
  - instructions (array of strings)
- **Relationships and foreign keys:** None
- **Notes on indexes or special constraints:** A full-text index will be created on the title and
  description fields to enable efficient searching.

### Matches Table

- **Table name:** matches
- **Key fields:**
  - id (serial primary key)
  - user1_id (integer, foreign key referencing users.id)
  - user2_id (integer, foreign key referencing users.id)
  - recipe_id (integer, foreign key referencing recipes.id)
- **Relationships and foreign keys:** The user1_id and user2_id fields have foreign key constraints
  referencing the users table, and the recipe_id field has a foreign key constraint referencing the
  recipes table.
- **Notes on indexes or special constraints:** A unique constraint will be placed on the user1_id,
  user2_id, and recipe_id fields to prevent duplicate matches.

### SwipeHistory Table

- **Table name:** swipe_history
- **Key fields:**
  - id (serial primary key)
  - user_id (integer, foreign key referencing users.id)
  - recipe_id (integer, foreign key referencing recipes.id)
  - swipe_direction (string, either 'left' or 'right')
- **Relationships and foreign keys:** The user_id field has a foreign key constraint referencing the
  users table, and the recipe_id field has a foreign key constraint referencing the recipes table.
- **Notes on indexes or special constraints:** A index will be created on the user_id and recipe_id
  fields to enable efficient querying.

## 3. API Endpoints

### Authentication

- **Signup:** Users should have the option to signup with google OR create an account and signup with their email.
- **Login:** Users should have the option to signup with google OR create an account and signup with their email.
- **Logout:** A logout endpoint will be provided to invalidate the user's session.

### Core Project & Document Management

- **GET /recipes:** Retrieve a list of recipes.
- **GET /recipes/:id:** Retrieve a specific recipe by ID.
- **POST /swipe:** Record a user's swipe action on a recipe.
- **GET /matches:** Retrieve a list of matches for the current user.

### Fix / Patch Flow

- Not applicable for the initial release.

### Templates & Suggestions

- For UI inspiration see the file `TinderUIExample.png`. That is Tinder's UI design.
- I want the simple picture, like/dislike ui home page then the option to show more. Show more resumes. When two people match is also pictured.

### Usage & Quotas

- **GET /usage:** Retrieve usage statistics for the current user.

## 4. LLM Integration

No LLM integration is planned for the initial release. A placeholder has been reserved for future
integration.

## 5. File Storage

No file storage is required for the initial release. A cloud storage solution (e.g., AWS S3) may be
used in the future to store user-generated content.

## 6. Rate Limiting & Tier Access

- **Rate limiting:** A rate limit of 100 requests per minute will be enforced for all API endpoints.
- **Tier access:** No tier access is planned for the initial release.

## 7. Error Handling

- **Centralized error logging table:** An error_logs table will be created to store error
  information. Erros logs save to local device
- **Fields:** error_type, user_id, message, timestamp

## 8. Security & Permissions

- **Row-level access control:** Row-level access control will be implemented to restrict access to
  sensitive data.
- **Public vs private data handling:** Public data will be accessible to all users, while private
  data will be restricted to authorized users.
- **Policies for shared documents or templates:** Not applicable for the initial release.

# User Management & Access Control â€” DinDin

## 1. Authentication Strategy

The authentication strategy for DinDin will support multiple methods to ensure flexibility and
convenience for users.

### Supported Methods

- **Email and Password**: Users can create an account using their email address and a password.
- **OAuth**: DinDin will support OAuth authentication through Google and GitHub.
- **Optional: Magic Link or OTP-based Login**: Users can also log in using a magic link or OTP
  (One-Time Password) for added convenience.

### Signup Flow

1. **Validate Input**: Ensure that user input (email, password, etc.) meets the required criteria.
2. **Check for Existing Email**: Verify that the provided email address does not already exist in
   the system.
3. **Email Verification (Optional)**: Send a verification email to the user's email address to
   confirm their identity.

### Login Flow

1. **Session Persistence**: Use JSON Web Tokens (JWT) or cookies to persist user sessions.
2. **Support for OAuth Providers**: Allow users to log in using their OAuth credentials.

### Session Handling

1. **Auto-refresh and Expiry Logic**: Implement logic to auto-refresh user sessions and set expiry
   times to ensure secure and efficient session management.
2. **Optional Session Revocation or Logout Tracking**: Provide features to revoke sessions or track
   user logouts for added security.

## 2. Roles & Permissions (RBAC)

DinDin will implement a Role-Based Access Control (RBAC) system to manage user roles and
permissions.

### Example Roles

- **Admin**: Full access to the application, including user management, billing, and feature
  control.
- **Standard User**: A regular user with access to core features, such as swiping through recipes
  and matching with other users.

### Permissions Matrix

| Feature                | Admin | Standard User |
| ---------------------- | ----- | ------------- |
| Manage Users           |       |               |
| Manage Billing         |       |               |
| Access Core Features   |       |               |
| Create/ Edit Profile   |       |               |
| Swipe Through Recipes  |       |               |
| Match with Other Users |       |               |

## 3. Subscription & Payment Plans

DinDin will offer a subscription-based model with multiple tiers to cater to different user needs.

### Provider

- **Stripe**: DinDin will use Stripe as its payment provider.

### Plan Tiers

- **Free**: Limited usage with access to basic features.
- **Premium**: Increased quota/features, including access to advanced recipe filtering and priority
  customer support.
- **Couples**: Custom features, including the ability to create joint profiles and match with other
  couples.

### Billing Flows

1. **Upgrade, Downgrade, Cancel**: Allow users to upgrade, downgrade, or cancel their subscription
   plans.
2. **Grace Periods and Usage Capping**: Implement grace periods and usage capping to prevent abuse
   and ensure fair usage.

## 4. Feature Gating & Onboarding

DinDin will control access to features based on user roles and plans.

### Gate Features by Role or Plan

- **Premium-only**: Advanced recipe filtering, priority customer support.
- **Admin-only**: User management, billing, and feature control.

### Onboarding

1. **Brief Walkthrough**: Display a brief walkthrough after signup to introduce users to the
   application's core features.
2. **User Input**: Collect user input to set context defaults and tailor the onboarding experience.

## 5. Security & Abuse Controls

DinDin will implement production-ready security protocols to prevent abuse and ensure secure user
interactions.

### Input Sanitization and Field Validation

- **Validate User Input**: Ensure that user input meets the required criteria to prevent SQL
  injection and cross-site scripting (XSS) attacks.

### Rate Limiting

- **Login**: 5 attempts/minute.
- **Signup**: 3 attempts/hour per email.

### Password Storage

- **bcrypt/scrypt**: Store passwords securely using bcrypt or scrypt.

### Abuse Prevention

- **Monitor User Activity**: Monitor user activity to prevent abuse and excessive usage.

## 6. Optional Extensions

DinDin may consider implementing the following optional extensions:

- **Team-level Roles**: Introduce team-level roles to manage user permissions and access control.
- **SSO / SAML Integration**: Integrate Single Sign-On (SSO) or Security Assertion Markup Language
  (SAML) for enterprise customers.
- **Invite-only Access or Waitlist Logic**: Implement invite-only access or waitlist logic to manage
  user onboarding and prevent abuse.

# File Structure: DinDin

## Overview

The following file structure is proposed for the DinDin project, a modern software application built
using React, TypeScript, and Supabase. The structure is designed to promote a clear separation of
concerns, scalability, and maintainability.

## Project Root

project-root/
â”œâ”€â”€ .env
â”œâ”€â”€ .gitignore
â”œâ”€â”€ README.md
â”œâ”€â”€ package.json
â””â”€â”€ tsconfig.json

## Public

public/
â”œâ”€â”€ favicon.ico
â””â”€â”€ index.html

## Source (src)

src/
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.tsx
â”œâ”€â”€ components/
â”‚ â”œâ”€â”€ Card.tsx
â”‚ â”œâ”€â”€ CardSwiper.tsx
â”‚ â”œâ”€â”€ TopBar.tsx
â”‚ â””â”€â”€ UserProfile.tsx
â”œâ”€â”€ pages/
â”‚ â”œâ”€â”€ Home.tsx
â”‚ â”œâ”€â”€ Match.tsx
â”‚ â”œâ”€â”€ Profile.tsx
â”‚ â””â”€â”€ NotFound.tsx
â”œâ”€â”€ api/
â”‚ â”œâ”€â”€ client.ts
â”‚ â”œâ”€â”€ recipe.ts
â”‚ â””â”€â”€ user.ts
â”œâ”€â”€ context/
â”‚ â””â”€â”€ AuthContext.tsx
â”œâ”€â”€ features/
â”‚ â”œâ”€â”€ authentication/
â”‚ â”‚ â”œâ”€â”€ GoogleAuth.tsx
â”‚ â”‚ â””â”€â”€ authSlice.ts
â”‚ â”œâ”€â”€ cardSwiper/
â”‚ â”‚ â”œâ”€â”€ CardSwiper.tsx
â”‚ â”‚ â””â”€â”€ cardSwiperSlice.ts
â”‚ â””â”€â”€ matching/
â”‚ â”œâ”€â”€ MatchAlgorithm.ts
â”‚ â””â”€â”€ matchSlice.ts
â”œâ”€â”€ hooks/
â”‚ â””â”€â”€ useAuth.ts
â”œâ”€â”€ models/
â”‚ â”œâ”€â”€ Recipe.ts
â”‚ â””â”€â”€ User.ts
â”œâ”€â”€ styles/
â”‚ â”œâ”€â”€ globals.css
â”‚ â””â”€â”€ components.css
â”œâ”€â”€ utils/
â”‚ â”œâ”€â”€ apiHelpers.ts
â”‚ â”œâ”€â”€ constants.ts
â”‚ â””â”€â”€ helpers.ts
â””â”€â”€ types/
 â”œâ”€â”€ api.ts
 â””â”€â”€ models.ts

## Supabase

supabase/
â”œâ”€â”€ schema.sql
â”œâ”€â”€ seed.sql
â””â”€â”€ edge-functions/
 â”œâ”€â”€ generateMatch.ts
 â””â”€â”€ usageTracker.ts

## Configuration

The project uses the following configuration files:

- `.env`: Environment variables (Supabase keys, Google Auth keys)
- `README.md`: Setup and usage instructions
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration

## Folder Descriptions

- **public**: Static assets and the main HTML entry point.
- **src**: Source code for the application.
  - **components**: Reusable UI components.
  - **pages**: Route-level views.
  - **api**: Frontend API functions calling backend or Supabase.
  - **context**: App-wide React contexts.
  - **features**: Feature-specific code (authentication, card swiper, matching).
  - **hooks**: Custom React hooks.
  - **models**: Data models (Recipe, User).
  - **styles**: Global styles and overrides.
  - **utils**: Utility functions.
  - **types**: Type definitions for API and models.
- **supabase**: Supabase database schema, seed data, and edge functions.

## Key Files

- `App.tsx`: App shell and global routes.
- `index.tsx`: Entry point for rendering the app.
- `CardSwiper.tsx`: Card swiper component.
- `MatchAlgorithm.ts`: Matching algorithm implementation.
- `generateMatch.ts`: Edge function for generating matches.

## Considerations

- Scalability: The project is designed to scale with a clear separation of concerns and a modular
  architecture.
- Environment Setup: The project uses environment variables to configure Supabase and Google Auth.
- Team Handoff: The project follows standard professional guidelines for code organization and
  naming conventions.

In conclusion, the PRD for DinDin provides a comprehensive overview of the product vision, target
users, key features, and non-functional requirements. By prioritizing user experience and retention,
DinDin aims to become the go-to platform for social dining and meal planning.
