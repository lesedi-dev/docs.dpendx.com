import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Environment variables with defaults
const DOCS_URL = process.env.DOCS_URL || "https://docs.dpendx.com";
const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || "https://github.com/dpendx";
const GITHUB_APP_INSTALL_URL = process.env.GITHUB_APP_INSTALL_URL || "https://github.com/apps/dpendx/installations/select_target";

const config: Config = {
    title: "dpendx",
    tagline: "Block insecure dependencies before they ship",
    favicon: "img/favicon.ico",

    future: {
        v4: true,
    },

    url: DOCS_URL,
    baseUrl: "/",

    organizationName: "dpendx",
    projectName: "dpendx",

    onBrokenLinks: "throw",
    onBrokenAnchors: "warn",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: `${GITHUB_REPO_URL}/tree/main/docs/`,
                    routeBasePath: "/",
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: "img/dpendx-social-card.png",
        colorMode: {
            defaultMode: "light",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        announcementBar: {
            id: "github_star",
            content:
                `If you like dpendx, give us a star on <a target="_blank" rel="noopener noreferrer" href="${GITHUB_REPO_URL}">GitHub</a>!`,
            backgroundColor: "#2e8555",
            textColor: "#fff",
            isCloseable: true,
        },
        navbar: {
            title: "dpendx",
            logo: {
                alt: "dpendx Logo",
                src: "img/logo.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    position: "left",
                    label: "Docs",
                },
                {
                    href: GITHUB_APP_INSTALL_URL,
                    label: "Install App",
                    position: "left",
                },
                {
                    href: GITHUB_REPO_URL,
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Getting Started",
                            to: "/getting-started/quick-start",
                        },
                        {
                            label: "Ecosystems",
                            to: "/ecosystems/overview",
                        },
                        {
                            label: "FAQ",
                            to: "/faq",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "GitHub",
                            href: GITHUB_REPO_URL,
                        },
                        {
                            label: "Discussions",
                            href: `${GITHUB_REPO_URL}/discussions`,
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} dpendx. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: [
                "go",
                "rust",
                "ruby",
                "java",
                "csharp",
                "php",
                "swift",
                "bash",
                "json",
                "yaml",
                "toml",
            ],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
