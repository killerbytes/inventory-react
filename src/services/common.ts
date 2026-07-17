import Http from "./http";

export default class CommonService {
  http = new Http();

  constructor() {}

  updateSheet = async () => {
    const response = await this.http.post(`/update-sheet`, {});
    return response;
  };

  backupDB = async () => {
    const response = await this.http.post(`/backup`, {});
    return response;
  };
}
