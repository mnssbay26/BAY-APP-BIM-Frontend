// tests/mocks/accMocks.js
import accProjectsMock from '../mocks/accProjects.mock'; // Adjust the path as needed
/*
import accProjectMock from './accProjectMock'; // Assuming you have a mock for a single ACC project
import accProjectUsersMock from './accProjectUsersMock'; // Mock for project users
import accProjectIssuesMock from './accProjectIssuesMock'; // Mock for project issues
import accProjectRfisMock from './accProjectRfisMock'; // Mock for project RFIs
*/

/**
 * Mocks fetching ACC projects data
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} route_url - The URL to intercept
 * @param {object} mockData - The mock data to return
 */
async function mockAcc(page, route_url, mockData) {
    await page.route(route_url, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData)
        });
    });
}

/**
 * Mocks fetching ACC projects data
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function mockAccProjectsData(page) {
    await mockAcc(page, '**/acc/projects', accProjectsMock);
}

/**
 * Mocks fetching a specific ACC project
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockAccProjectData(page, projectId, accountId) {
    await mockAcc(page, `**/acc/projects/${accountId}/${projectId}`, accProjectMock);
}

/**
 * Mocks fetching ACC project users
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockAccProjectUsers(page, projectId, accountId) {
    await mockAcc(page, `**/acc/projects/${accountId}/${projectId}/users`, accProjectUsersMock);
}

/**
 * Mocks fetching ACC project issues
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockAccProjectIssues(page, projectId, accountId) {
    await mockAcc(page, `**/acc/projects/${accountId}/${projectId}/issues`, accProjectIssuesMock);
}

/**
 * Mocks fetching ACC project RFIs
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockAccProjectRfis(page, projectId, accountId) {
    await mockAcc(page, `**/acc/projects/${accountId}/${projectId}/rfis`, accProjectRfisMock);
}