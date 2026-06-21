module.exports = {
  // ... existing config ...

  rules: {
    // ... existing rules ...

    // UI Registry Strict Rules
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement > JSXIdentifier[name=/^(div|span|header|nav|main|section|article|aside|footer|h1|h2|h3|h4|h5|h6|p|strong|em|a|img|picture|figure|figcaption|video|audio|iframe|ul|ol|li|table|thead|tbody|tr|th|td|form|input|textarea|select|option|button|label|fieldset|legend|dialog|details|summary|canvas|svg|template|slot|br|hr|code|pre)$/i]',
        message: 'Direct use of HTML elements is forbidden. Use UI-identified components from @/components/ui instead. Example: use <UiDiv ui={...}> instead of <div>',
      },
      {
        selector: 'MemberExpression[object.name=/^(localStorage|sessionStorage)$/]',
        message: 'Direct use of localStorage/sessionStorage is forbidden. Use GovaDB from @/lib/gova-db instead.',
      },
    ],
    'react/forbid-component-props': [
      'error',
      {
        forbidden: [
          {
            propName: 'className',
            message: 'Use UI-identified components with ui prop instead of className for styling',
          },
        ],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/components/ui/*'],
            message: 'Import UI components from @/components/ui only. Do not import from subdirectories.',
            allowTypeImports: true,
          },
        ],
      },
    ],
  },
};
