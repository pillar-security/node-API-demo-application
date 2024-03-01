## Pillar Security Worked API Example

This is a simple node-express API application to interact with OpenAI.

To get started, first clone the repository.
Then, `npm install`.
Make sure to copy the `.env.template` to a `.env` file and add your credentials.
Finally, run `node --env-file=.env index.js` to run the server.

You can interact with the server using Postman or any other favorite API client (e.g., `cURL`).

To test the API, execute a `POST` request to `http://localhost:8000/interact`.

The request should have a body in the following format:
```json
{
  "prompt": "Here is some user input that will be sent to OpenAI."
}
```
