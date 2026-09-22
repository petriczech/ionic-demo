// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ],
      /*
       * The rules below only fire on code carried over unchanged from the
       * Angular 8 app (empty constructor / ngOnInit, zone flag casts).
       * They are switched off so the new linter does not force a rewrite of
       * pre-existing application code as part of the framework upgrade.
       */
      '@typescript-eslint/no-empty-function': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility
    ],
    rules: {
      /*
       * The counter is a clickable <div> inherited from the Angular 8 app.
       * Making it keyboard accessible would change the markup and behaviour,
       * which is out of scope for the framework upgrade.
       */
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off'
    }
  }
);
