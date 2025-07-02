const bim360ProjectsMock = {
    data: {
        projects: [
            {
                type: "projects",
                id: "b.fake-id-1", // Use a fake unique identifier
                attributes: {
                    name: "Fake Project 1", // Fake project name
                    scopes: [
                        "b360project.fake-id-1",
                        "O2tenant.fake-id-1"
                    ],
                    extension: {
                        type: "projects:autodesk.bim360:Project",
                        version: "1.0",
                        schema: {
                            href: "https://fakeurl.com/schema/v1/versions/projects:autodesk.bim360:Project-1.0" // Fake schema URL
                        },
                        data: {
                            projectType: "BIM360" // Keep the type for context
                        }
                    }
                },
                links: {
                    self: {
                        href: "https://fakeurl.com/project/v1/hubs/fake-hub-id/projects/b.fake-id-1" // Fake self link
                    },
                    webView: {
                        href: "https://docs.b360.fakeurl.com/projects/fake-id-1" // Fake web view link
                    }
                },
                relationships: {
                    hub: {
                        data: {
                            type: "hubs",
                            id: "b.fake-hub-id" // Fake hub ID
                        },
                        links: {
                            related: {
                                href: "https://fakeurl.com/project/v1/hubs/b.fake-hub-id" // Fake related hub link
                            }
                        }
                    },
                    rootFolder: {
                        data: {
                            type: "folders",
                            id: "urn:adsk.wipprod:fs.folder:fake-folder-id-1" // Fake folder ID
                        },
                        meta: {
                            link: {
                                href: "https://fakeurl.com/data/v1/projects/b.fake-id-1/folders/urn:adsk.wipprod:fs.folder:fake-folder-id-1" // Fake folder link
                            }
                        }
                    },
                    // Add other relationships as needed with fake data
                }
            },
            {
                type: "projects",
                id: "b.fake-id-2", // Another fake unique identifier
                attributes: {
                    name: "Fake Project 2", // Another fake project name
                    scopes: [
                        "b360project.fake-id-2",
                        "O2tenant.fake-id-2"
                    ],
                    extension: {
                        type: "projects:autodesk.bim360:Project",
                        version: "1.0",
                        schema: {
                            href: "https://fakeurl.com/schema/v1/versions/projects:autodesk.bim360:Project-1.0" // Fake schema URL
                        },
                        data: {
                            projectType: "BIM360" // Keep the type for context
                        }
                    }
                },
                links: {
                    self: {
                        href: "https://fakeurl.com/project/v1/hubs/fake-hub-id/projects/b.fake-id-2" // Fake self link
                    },
                    webView: {
                        href: "https://docs.b360.fakeurl.com/projects/fake-id-2" // Fake web view link
                    }
                },
                relationships: {
                    hub: {
                        data: {
                            type: "hubs",
                            id: "b.fake-hub-id" // Fake hub ID
                        },
                        links: {
                            related: {
                                href: "https://fakeurl.com/project/v1/hubs/b.fake-hub-id" // Fake related hub link
                            }
                        }
                    },
                    rootFolder: {
                        data: {
                            type: "folders",
                            id: "urn:adsk.wipprod:fs.folder:fake-folder-id-2" // Fake folder ID
                        },
                        meta: {
                            link: {
                                href: "https://fakeurl.com/data/v1/projects/b.fake-id-2/folders/urn:adsk.wipprod:fs.folder:fake-folder-id-2" // Fake folder link
                            }
                        }
                    },
                    // Add other relationships as needed with fake data
                }
            }
        ]
    },
    error: null,
    message: "Access to BIM360 projects granted" // Keep the message for context
};

export default bim360ProjectsMock;