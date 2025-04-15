import antfu from '@antfu/eslint-config';

export default antfu(
  {
    // Without `files`, they are general rules for all files
    rules: {
      'style/semi': ['error', 'always'],
    },
  },
);
