## Running Locally
1) ensure .env updated
2) Run backend locally as well
3) execute `npm run dev`

## Testing

### To run tests, use the following command:
`npx playwright test`

### To run tests in a specific folder, add as a 4th argument the file path.
`npx playwright test path/to/tests`

For example,
`npx playwright tests tests/e2e # for just e2e tests` 
`npx playwright tests tests/e2e/home # for just e2e tests on the home page` 