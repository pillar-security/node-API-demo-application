## Pillar Security Worked API Example

This is a simple node-express API application to interact with OpenAI.

### Getting Started
1. Clone the repository.
2. `npm install`
3. Copy the `.env.template` to a `.env` file; add your credentials.
4. Run `node --env-file=.env index.js` to start the server.


You can interact with the server using Postman or any other favorite API client (e.g., `cURL`).
To test the API, execute a `POST` request to `http://localhost:8080/interact`.

The request should have a body in the following format:
```json
{
  "prompt": "Here is some user input that will be sent to OpenAI."
}
```

Using `cURL`, this could look like this:
```bash
curl -X POST \
-H "Content-Type: application/json" \
-d '{"prompt": "Here is some user input that will be sent to OpenAI."}' \
http://localhost:8080/interact
```
