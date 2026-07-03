export const lifecycle = {
  onLoad: 0,
  onStart: 0,
  onStop: 0,
};

const plugin = {
  manifest: {
    id: "fixture.default-export",
    name: "Fixture Default Export",
    version: "1.0.0",
  },
  onLoad: () => {
    lifecycle.onLoad += 1;
  },
  onStart: () => {
    lifecycle.onStart += 1;
  },
  onStop: () => {
    lifecycle.onStop += 1;
  },
};

export default plugin;
