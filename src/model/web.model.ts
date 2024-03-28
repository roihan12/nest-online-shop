export class WebResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  errors?: string;
}
