# Templa - AI-Powered Document Generator

Templa is a powerful web application that leverages AI to automate the creation of Word documents and PowerPoint presentations. Users can define a structure, and the AI will generate the content, which can then be refined and exported.

## Features

- **User Authentication**: Secure user registration and login using Firebase.
- **Project Management**: Create, delete, and manage your document projects.
- **AI Content Generation**: Automatically generate content for your documents based on a defined structure.
- **Content Refinement**: Edit and refine the AI-generated content.
- **Export**: Export your documents to `.docx` (Word) and `.pptx` (PowerPoint) formats.

## Installation and Setup

**Prerequisites:** [Node.js](https://nodejs.org/)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Tab-To-LightSpeed24/Templa-AI-App
    cd Templa-AI-App
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section for more details.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

| Variable                          | Description                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_GEMINI_API_KEY`             | Your API key for the Gemini API.                                                                                                             |
| `VITE_FIREBASE_API_KEY`           | Your Firebase project's API key.                                                                                                             |
| `VITE_FIREBASE_AUTH_DOMAIN`       | Your Firebase project's authentication domain.                                                                                               |
| `VITE_FIREBASE_PROJECT_ID`        | Your Firebase project's ID.                                                                                                                  |
| `VITE_FIREBASE_STORAGE_BUCKET`    | Your Firebase project's storage bucket.                                                                                                      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase project's messaging sender ID.                                                                                                 |
| `VITE_FIREBASE_APP_ID`            | Your Firebase project's app ID.                                                                                                              |

## Running the Application

This is a full-stack application with a React frontend and a Node.js backend, both of which can be started with a single command.

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to `http://localhost:3000/` (or the address shown in your terminal).

## Demo Video

Watch this 5-10 minute video to see a full demonstration of the application's features:

[](https://youtu.be/r7OJfi-p2hQ)

**Video Content:**

- **User Registration & Login**:
  - Creating a new account.
  - Logging in with an existing account.
- **Configuring a Word Document**:
  - Creating a new Word document project.
  - Defining the sections and structure.
- **Configuring a PowerPoint Document**:
  - Creating a new PowerPoint presentation project.
  - Outlining the slides and their content.
- **Content Generation**:
  - Using the "Magic Fill All" feature to generate content for the entire document.
  - Generating content for individual sections.
- **Refinement**:
  - Making manual edits to the AI-generated text.
  - Using AI-powered refinement suggestions.
- **Exporting Files**:
  - Exporting the final document as a `.docx` file.
  - Exporting the final presentation as a `.pptx` file.
