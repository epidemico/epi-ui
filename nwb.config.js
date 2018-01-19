module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'EpiUI',
      externals: {
        react: 'React',
      },
    },
  },
}
