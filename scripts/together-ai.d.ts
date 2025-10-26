declare module 'together-ai' {
  class Together {
    images: {
      create(params: {
        model: string;
        width: number;
        height: number;
        steps: number;
        prompt: string;
      }): Promise<{ data: { url: string }[] }>;
    };
  }

  export default Together;
}