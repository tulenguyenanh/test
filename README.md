# Trustana FE Take home assignment (Senior)

PLEASE READ the following instructions carefully first before proceeding.

## Instructions

1. Clone the repository to your local machine.
2. A SUBMISSION.md file has been created in the root of the repository. This SUBMISSION.md will be the file where you will describe your solution, issues, assumptions and other information.
3. If the data / mock apis provided are incorrect, please fix it as you deem fit and include it under the section "Fixes" in your SUBMISSION.md.
4. If you made any assumptions, please include them under the section "Assumptions" in your SUBMISSION.md.
5. You can install any additional dependencies you may need, but do explain your decisions in the SUBMISSION.md file.

## Introduction

Trustana is a product data platform that enable retailers to transform and manipulate their product efficiently according to their needs.

### Your Task

Your task is to create a web application that allows users to view, search and perform complex filters on product data in a table style format. As a user, I want to quickly filter product attributes, create custom views, manipulate columns, save filters and share them with my team.

You are provided a list of mock apis that you can use to get the data you need. As these are mock apis reading from static files, you can skip Create / Update / Delete operations. **HOWEVER, your frontend architecture must be designed with considerations of a complete CRUD application in mind.**

(For simplicity, these are built into NextJS API router, please assume that they are backend apis)

- /api/products
- /api/attributes

### API Consumption examples

```ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const attributes = await fetch(`${baseUrl}/api/attributes`, {
  method: "POST",
  body: JSON.stringify({
    filter: {
      name: { $eq: "Color" },
    },
  }),
});

const attributes = await fetch(`${baseUrl}/api/products`, {
  method: "POST",
  body: JSON.stringify({
    filter: {
      attributes: {
        netWeightPerUnitValue: {
          value: {
            $gt: 10,
          },
        },
      },
    },
  }),
});
```

### Non-negotiables

1. You must use TypeScript.
2. You must use React.
3. You must use Next.js.
4. You must use the provided mock APIs.
5. You must use the provided types.
6. You must use the provided enums.
7. Implement comprehensive error management
   - Examples but not limited to: client error boundaries, error logging, etc.
8. Implement observability and web vitals tracking
   - Examples but not limited to: Performance metrics, request tracing etc.
9. Implement appropriate tool chains for codebase maintainability and quality
   - Examples but not limited to: linting etc.
10. Implement an E2E test for the filter functionality.
11. Create Dockerfile for container based deployment.

### Product requirements

- Fast render times (interpret this requirement as you see fit)
- Shareable filters (interpret this requirement as you see fit)
- Default products per view: 100

### System constraints

- Max attributes per supplier: 1,000
- Expected products per supplier: 10,000 - 300,000

### Browser Support:

- Modern browsers
- Responsiveness - Desktop

### Usage of AI

Feel free to use any AI tools to help you with the assignment. However, you will be expected to explain your solution during the followup interview.

## Submission

1. Document tool / framework / library decisions and considerations, your overall roadblocks, assumptions, issues and incomplete tasks if any in the submission.md file.
2. Deployment to a hosted service provider is optional but greatly appreciated.
3. Submit your repository link + the deployed link (If any)

## FAQ

1. Why are there weird fields present in the mock JSON but are not present in the types?

   - To simplify the assignment, we have removed some fields that are not relevant to the task, only focus on the fields that are present in the types provided.

2. I think I found some issues with the mock data / apis provided.

   - Please fix the issues to the best of your ability and include it under the section "Fixes" in your SUBMISSION.md.

3. I have some questions related to the user experience and the UI.

   - If you cannot get answers to your questions in time, please state your assumptions, continue with the assignment and include it under the section "Assumptions" in your SUBMISSION.md.

4. Can I design the UI however I want? Can I include any additional features?
   - Yes, go crazy, go wild, we love surprises.
