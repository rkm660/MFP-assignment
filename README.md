# MFP Assignment

## Prerequisites

1. Node (tested on 8.6.0)
2. NPM  (tested on 5.5.1)
3. Serverless account - https://serverless.com/framework/docs/getting-started/
4. Account on AWS - console.aws.amazon.com

## Installing

1. Clone the repo
2. npm install in root dir
3. "serverless offline start" to run locally (on port 3000)

## Testing

An instance of the API is currently deployed to https://lxzmp4mx7j.execute-api.us-east-1.amazonaws.com/dev/

1. To post a chat, make a POST request to /chat with an example request as follows:

{
	"username" : "test_user",
	"text" : "test_message",
	"timeout" : 60
}

You should expect a response as follows:

{
    "id": "5aac216bb775d96d0656ce86"
}

2. To get a chat by id, make a GET request to /chat/{id}. You can expect a response as follows:

{
    "username": "test_user",
    "text": "test_message",
    "expiration_date": "2018-03-16 19:59:05"
}

3. To get an array of chats by username, make a GET request to /chat/{username}.

[
    {
        "id": "5aac2146b775d92aee56ce85",
        "text": "test_message_1"
    },
    {
        "id": "5aac216bb775d96d0656ce86",
        "text": "test_message_2"
    }
]

4. In the case of any error, you should expect a JSON response as follows:

{
    "message" : "Example error message."
}

## Deployment

Run "serverless deploy" to deploy to your own AWS account.

## Built With

- Node.js
- Serverless
- AWS
- MongoDB
