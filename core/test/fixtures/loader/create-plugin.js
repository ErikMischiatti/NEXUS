export const lifecycle = {
  onLoad: 0,
  onStart: 0,
  onStop: 0,
};

export function createPlugin() {
  return {
    manifest: {
      id: "fixture.create-plugin",
      name: "Fixture Create Plugin",
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
}
