
# Evaluating User Experience in Digital Technologies — Comparative Study

# Project Title: What affect does AI assistance have on creative expression in a web-based drawing platform?
### Authors: Belle Williams & Keya Datta
### Unit: Methods 5: Evaluating User Experience in Digital Technologies
### Institution: University of the Arts London (UAL)
### Year: 2025/2026

## Overview

#### This project is a web-based drawing platform created as part of a comparative user experience study for the unit Evaluating User Experience in Digital Technologies at UAL.
#### The prototype explores how AI assistance affects creative expression during a convergent design task. Participants complete the same drawing task in two conditions: one without AI support and one with an embedded AI chat assistant.
#### The platform was designed to be lightweight, accessible on tablets (including iPad), and easy to deploy remotely for participant testing.

## Study Design

#### The study adopts a comparative within-subjects design with two conditions:

#### Condition A — Without AI: Participants create their design manually using the digital drawing interface.

#### Condition B — With AI: Participants generate and refine their idea with AI assistance before sketching or finalising their concept.

#### Both sessions use the same creative brief and are followed by post-task questionnaires and interviews to measure user experience and perceived creativity.

## Convergent Thinking Task

#### You are given three elements: Memory, Glass, and Light.
#### Your task: Combine them into one single futuristic design.
#### Think about how these could work together as a new functional or symbolic creation — something that could exist in the near or distant future.
#### Present one final, well-defined idea only.

#### This task encourages integration and focused problem-solving while still allowing for imaginative and speculative design outcomes.

## Methods

#### Quantitative Measures:

##### Creativity Support Index (CSI) — non-weighted version used post-task to measure perceived creativity support.

#### Qualitative Measures:

##### Semi-structured interviews exploring experience, engagement, and perception of the AI-assisted and manual conditions.

##### Observational notes on interaction behaviour during each task.

# Prototype Overview

## Structure of the project:
#### The project is split into a front end and a back end:
#### The front end contains the user interface, drawing canvas, and interaction logic. This includes the homepage, the “With AI” page, and the “Without AI” page, along with their associated stylesheets and JavaScript.
#### The back end is a small Node.js server that handles communication with the OpenAI API and acts as a secure middle layer so that API keys are never exposed in the browser.
#### Node modules and dependencies are defined in the package configuration but are not included here due to file upload limits.

## How to run the project locally:
#### To run the project locally, Node.js must be installed.
#### After installing dependencies using the package configuration, the server can be started locally. Once running, the front-end pages can communicate with the local server for AI responses.
#### When running locally, the AI functionality will only work if a valid OpenAI API key is present as an environment variable.

## Deployment and hosting setup:
#### The project is deployed using a split hosting approach to keep the system secure and flexible.
#### The front end is hosted using GitHub Pages. This allows the interface to be served as static files, making it fast, stable, and easy to access on tablets and mobile devices without requiring any server setup on the client side.
#### The back end is hosted on Render. Render runs the Node.js server and handles API requests to OpenAI. The front end sends requests to this server rather than directly to OpenAI, which prevents API keys from being exposed in client-side code.
#### This setup allows the platform to be publicly accessible while still keeping sensitive credentials secure.

## API key security
#### The OpenAI API key is stored using environment variables rather than being hard-coded into the project.
#### A .env file is used locally, and environment variables are configured directly in the Render dashboard for deployment.
#### File permissions were set to restrict access to sensitive configuration files, ensuring the API key is not accidentally committed or exposed.
#### This approach follows standard best practices for API security in web applications.

## Data submission and storage
#### Participant drawings and metadata are submitted using an external form handling service (Formspree).
#### When a participant clicks “Save Drawing”, the canvas image is converted into a data URL and sent via a hidden form along with the participant number.
#### Using a third-party form service allowed data to be collected reliably without the need to build a custom database, which helped keep the prototype lightweight and appropriate for a short research study.
#### All submissions were collected anonymously. Participants did not provide any personally identifiable information, and each participant gave informed consent before taking part.
#### Drawings and associated metadata submitted via Formspree were used solely for the purposes of this research study. All data will be securely stored for the duration of the project and retained for no longer than one year after the completion of the study, after which it will be permanently deleted.

## Accessibility and UX considerations
#### The interface was designed to be simple and touch-friendly, with large buttons, minimal controls, and clear visual hierarchy.
#### Separating the AI and non-AI conditions into different pages reduces confusion and helps preserve the validity of the comparative study.
#### Hosting the front end independently ensures the platform works smoothly on iPads and university devices without requiring local installation.

## References / Technical Sources

#### GitHub Pages. Static site hosting for front-end deployment.
#### https://pages.github.com/

#### Render. Cloud platform for hosting Node.js back-end services.
#### https://render.com/

#### OpenAI API. Used to provide AI-assisted idea generation via a chat interface.
#### https://platform.openai.com/docs

#### Formspree. Form handling service used to collect canvas images and participant data.
#### https://formspree.io/

#### Pixabay. Royalty-free images used for visual object prompts.
#### https://pixabay.com/

#### Node.js. JavaScript runtime used for the server-side environment.
#### https://nodejs.org/

#### Express.js. Web framework used to handle API routing and requests.
#### https://expressjs.com/

## Github Link
#### https://github.com/bellewills/UX-Research-Project
