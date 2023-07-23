


export type Message = {
  image?: string
  name: string,
  status?: 'loading' | 'loaded' | 'error',
};

export type State = {
  config: {
    routes: [{
      label: string,
      url: string,
    }],
  },
};

declare global {
  interface Window {
    __DOMAIN__: string,
    __PUBLIC_KEY__: string,
  }
}
