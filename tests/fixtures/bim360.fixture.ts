import bim360ProjectsMock from '../mocks/bim360Projects.mock';
/*
import bim360ProjectMock from '../mocks/bim360ProjectMock'; 
import bim360ProjectUsersMock from '../mocks/bim360ProjectUsersMock'; 
import bim360ProjectIssuesMock from '../mocks/bim360ProjectIssuesMock'; 
import bim360ProjectRfisMock from '../mocks/bim360ProjectRfisMock'; 
*/

/**
 * Mocks fetching BIM 360 projects data
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} route_url - The URL to intercept
 */
async function mockBim360(page, route_url, mockData){
    await page.route(route_url, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData)
        });
    });
}

/**
 * Mocks fetching BIM 360 projects data
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function mockBim360ProjectsData(page) {
    await mockBim360(page, '**/bim360/projects', bim360ProjectsMock);
}

/**
 * Mocks fetching a specific BIM 360 project
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockBim360ProjectData(page, projectId, accountId) {
    await mockBim360(page, `**/bim360/projects/${accountId}/${projectId}`, bim360ProjectMock);
}

/**
 * Mocks fetching a BIM 360 federated model
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockBim360FederatedModel(page, projectId, accountId) {
    await mockBim360(page, `**/datamanagement/${accountId}/${projectId}/federated-model`, { federatedModel: 'fakeBase64String' }); // Mocked base64 string
}

/**
 * Mocks fetching BIM 360 project users
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockBim360ProjectUsers(page, projectId, accountId) {
    await mockBim360(page, `**/bim360/projects/${accountId}/${projectId}/users`, bim360ProjectUsersMock);
}

/**
 * Mocks fetching BIM 360 project issues
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockBim360ProjectIssues(page, projectId, accountId) {
    await mockBim360(page, `**/bim360/projects/${accountId}/${projectId}/issues`, bim360ProjectIssuesMock);
}

/**
 * Mocks fetching BIM 360 project RFIs
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} projectId - The ID of the project
 * @param {string} accountId - The account ID
 */
export async function mockBim360ProjectRfis(page, projectId, accountId) {
    await mockBim360(page, `**/bim360/projects/${accountId}/${projectId}/rfis`, bim360ProjectRfisMock);
}