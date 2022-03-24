export class NotionApi {
  constructor(key, prefixUrl = '') {
    this.key = key;
    this.prefixUrl = prefixUrl + 'https://api.notion.com/v1/';
  }

  get headers() {
    return {
      'Notion-Version': '2022-02-22',
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
    };
  }

  async getPage(id) {
    const response = await fetch(`${this.prefixUrl}pages/${id}`, {
      headers: this.headers,
    });
    const result = await response.json();
    return result;
  }

  async updatePage(id, properties) {
    const response = await fetch(`${this.prefixUrl}pages/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ properties }),
    });
    const result = await response.json();
    return result;
  }
}
