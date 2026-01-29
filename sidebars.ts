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
      label: 'Features',
      items: [
        'features/sbom-generation',
        'features/license-compliance',
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
    'faq',
  ],
};

export default sidebars;
