
export type ReducerState = {

};

export type Message = {
  image?: string
  name: string,
  status?: 'loading' | 'loaded' | 'error',
};

declare global {
  interface Window {
    __DOMAIN__: string,
    __PUBLIC_KEY__: string,
  }
}
