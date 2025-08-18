// tests/mocks/accProjectsMock.js

const accProjectsMock = {
    data: {
        projects: [
            {
                type: "projects",
                id: "b.7b87aeaa-705f-4d0a-ade6-e10617f7da0d",
                attributes: {
                    name: "Fake Project 1",
                    scopes: [
                        "fakeScope1",
                        "fakeScope2"
                    ],
                    extension: {
                        type: "projects:autodesk.bim360:Project",
                        version: "1.0",
                        schema: {
                            href: "https://fakeurl.com/schema/v1/versions/projects:autodesk.bim360:Project-1.0"
                        },
                        data: {
                            projectType: "ACC"
                        }
                    }
                },
                links: {
                    self: {
                        href: "https://fakeurl.com/projects/b.7b87aeaa-705f-4d0a-ade6-e10617f7da0d"
                    },
                    webView: {
                        href: "https://fakeurl.com/docs/files/projects/7b87aeaa-705f-4d0a-ade6-e10617f7da0d"
                    }
                },
                relationships: {
                    hub: {
                        data: {
                            type: "hubs",
                            id: "b.fakehubid"
                        },
                        links: {
                            related: {
                                href: "https://fakeurl.com/hubs/b.fakehubid"
                            }
                        }
                    },
                    rootFolder: {
                        data: {
                            type: "folders",
                            id: "urn:adsk.wipprod:fs.folder:fakefolderid"
                        },
                        meta: {
                            link: {
                                href: "https://fakeurl.com/data/v1/projects/b.7b87aeaa-705f-4d0a-ade6-e10617f7da0d/folders/urn:adsk.wipprod:fs.folder:fakefolderid"
                            }
                        }
                    },
                    // Additional relationships can be added here
                }
            },
            {
                type: "projects",
                id: "b.fakeprojectid2",
                attributes: {
                    name: "Fake Project 2",
                    scopes: [
                        "fakeScope3",
                        "fakeScope4"
                    ],
                    extension: {
                        type: "projects:autodesk.bim360:Project",
                        version: "1.0",
                        schema: {
                            href: "https://fakeurl.com/schema/v1/versions/projects:autodesk.bim360:Project-1.0"
                        },
                        data: {
                            projectType: "ACC"
                        }
                    }
                },
                links: {
                    self: {
                        href: "https://fakeurl.com/projects/b.fakeprojectid2"
                    },
                    webView: {
                        href: "https://fakeurl.com/docs/files/projects/fakeprojectid2"
                    }
                },
                relationships: {
                    hub: {
                        data: {
                            type: "hubs",
                            id: "b.fakehubid2"
                        },
                        links: {
                            related: {
                                href: "https://fakeurl.com/hubs/b.fakehubid2"
                            }
                        }
                    },
                    rootFolder: {
                        data: {
                            type: "folders",
                            id: "urn:adsk.wipprod:fs.folder:fakefolderid2"
                        },
                        meta: {
                            link: {
                                href: "https://fakeurl.com/data/v1/projects/b.fakeprojectid2/folders/urn:adsk.wipprod:fs.folder:fakefolderid2"
                            }
                        }
                    },
                    // Additional relationships can be added here
                }
            }
        ]
    },
    error: null,
    message: "Access to ACC projects granted"
};

export default accProjectsMock;