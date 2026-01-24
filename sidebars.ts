import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/first-scan',
        'getting-started/understanding-results',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/how-it-works',
        'core-concepts/vulnerability-scanning',
        'core-concepts/reachability-analysis',
        'core-concepts/check-run-outcomes',
        'core-concepts/osv-database',
      ],
    },
    {
      type: 'category',
      label: 'Ecosystems',
      items: [
        'ecosystems/overview',
        'ecosystems/go',
        'ecosystems/npm',
        'ecosystems/python',
        'ecosystems/rust',
        'ecosystems/ruby',
        'ecosystems/java',
        'ecosystems/dotnet',
        'ecosystems/php',
        'ecosystems/cocoapods',
      ],
    },
    {
      type: 'category',
      label: 'Self-Hosting',
      items: [
        'self-hosting/overview',
        'self-hosting/github-app-setup',
        {
          type: 'category',
          label: 'Deployment',
          items: [
            'self-hosting/deployment/railway',
            'self-hosting/deployment/docker',
            'self-hosting/deployment/kubernetes',
          ],
        },
        'self-hosting/database-setup',
        'self-hosting/environment-variables',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/overview',
        'api-reference/webhooks',
        'api-reference/health-endpoint',
        'api-reference/scan-endpoint',
        'api-reference/fix-endpoint',
        'api-reference/data-models',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/scan-errors',
        'troubleshooting/webhook-issues',
        'troubleshooting/parser-issues',
        'troubleshooting/faq',
      ],
    },
  ],
};

export default sidebars;
