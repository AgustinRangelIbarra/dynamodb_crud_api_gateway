const dynamoDB = require("./db");
const {
	GetItemCommand,
	PutItemCommand,
	DeleteItemCommand,
	ScanCommand,
	UpdateItemCommand,
} = require("@aws-sdk/client/dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getPost = async (event) => {
	const response = { statusCode: 200 };
	try {
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ postId: event.pathParameters.postId }),
		};
		const { Item } = await dynamoDB.send(new GetItemCommand(params));

		console.log({ Item });
		response.body = JSON.stringify({
			message: "Succesfully retrieved post.",
			data: Item ? unmarshall(Item) : {},
			rawData: Item,
		});
	} catch (error) {
		console.error(error);
		(response.statusCode = 500),
			(response.body = JSON.stringify({
				message: "Failed to get post.",
				errorMsg: e.message,
				errorStack: e.stack,
			}));
	}

	return response;
};

const createPost = async (event) => {
	const response = { statusCode: 200 };
	try {
		const body = JSON.parse(event.body);
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Item: marshall(body || {}),
		};
		const createResult = await dynamoDB.send(new PutItemCommand(params));

		response.body = JSON.stringify({
			message: "Succesfully created post.",
			createResult,
		});
	} catch (error) {
		console.error(error);
		(response.statusCode = 500),
			(response.body = JSON.stringify({
				message: "Failed to create post.",
				errorMsg: e.message,
				errorStack: e.stack,
			}));
	}

	return response;
};

const updatePost = async (event) => {
	const response = { statusCode: 200 };

	try {
		const body = JSON.parse(event.body);
		const objKeys = Object.keys(body);
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ postId: event.pathParameters.postId }),
			UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`)}`,
			ExpressionAttributeNames: objKeys.reduce(
				(acc, key, index) => ({
					...acc,
					[`#key${index}`]: key,
				}),
				{}
			),
			ExpressionAttributeValues: marshall(
				objKeys.reduce(
					(acc, key, index) => ({
						...acc,
						[`:value${index}`]: body[key],
					}),
					{}
				)
			),
		};

		const updateResult = await dynamoDB.send(new UpdateItemCommand(params));

		response.body = JSON.stringify({
			message: "Succesfully updated post.",
			updateResult,
		});
	} catch (error) {
		console.error(error);
		(response.statusCode = 500),
			(response.body = JSON.stringify({
				message: "Failed to update post.",
				errorMsg: e.message,
				errorStack: e.stack,
			}));
	}

	return response;
};

const deletePost = async (event) => {
	const response = { statusCode: 200 };

	try {
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ postId: event.pathParameters.postId }),
		};

		const deleteResult = await dynamoDB.send(new DeleteItemCommand(params));

		response.body = JSON.stringify({
			message: "Succesfully deleted post.",
			updateResult: deleteResult,
		});
	} catch (error) {
		console.error(error);
		(response.statusCode = 500),
			(response.body = JSON.stringify({
				message: "Failed to delete post.",
				errorMsg: e.message,
				errorStack: e.stack,
			}));
	}

	return response;
};

const getAllPosts = async (event) => {
	const response = { statusCode: 200 };

	try {
		const { Items } = await dynamoDB.scan(
			new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
		);

		response.body = JSON.stringify({
			message: "Succesfully retrieved all posts.",
			data: Items.map((item) => unmarshall(item)),
			Items,
		});
	} catch (error) {
		console.error(error);
		(response.statusCode = 500),
			(response.body = JSON.stringify({
				message: "Failed to retrieve all posts.",
				errorMsg: e.message,
				errorStack: e.stack,
			}));
	}

	return response;
};

module.exports = {
	getPost,
	createPost,
	updatePost,
	deletePost,
	getAllPosts,
};
