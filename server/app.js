const express = require("express");
const multer = require("multer");
const { writeFileSync } = require("node:fs");
const path = require("node:path");

const app = express();

// 使用 Express 内置的中间件解析 JSON 格式的数据
app.use(express.json());

// 使用 Express 内置的中间件解析 urlencoded 格式的数据（例如：表单数据）
app.use(express.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, "uploads-directory/");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const ext = file.originalname.split(".").pop();
		cb(null, "multipart/form-data方式上传_" + Date.now() + "." + ext);
	},
});
const upload = multer({ storage });

// 跨域配置
app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, x-ext");
	next();
});

// ***** multipart/form-data *****
app.post("/upload", upload.single("file"), (req, res) => {
	if (req.file) {
		res.send("multipart/form-data方式：ok");
	} else {
		res.send("multipart/form-data方式：error");
	}
});
// ***** multipart/form-data end *****

// ***** base64 *****
app.post("/upload-base64", (req, res) => {
	console.log("收到 base64 上传请求");
	const { base64File, name, type, size, lastModified } = req.body;
	if (!base64File || !type) {
		console.error("缺少必要的参数");
		return res.status(400).send("缺少必要的参数");
	}
	console.log("size:", size);
	if (size > 10 * 1024) {
		console.log("文件超过10k，禁止上传");
		return res.status(413).send("文件超过10k，禁止base64方式上传");
	}
	const binaryData = Buffer.from(base64File, "base64");
	const fileName = `base64方式上传_${Date.now()}.${name.split(".").pop()}`;
	const filePath = `${uploadPath}${fileName}`;

	try {
		writeFileSync(filePath, binaryData, "binary");
		console.log(`文件已保存: ${filePath}`);
		res.send("base64方式：ok");
	} catch (e) {
		console.error("base64写入文件错误", e);
		res.status(500).send("服务器内部错误");
	}
});
// ***** base64 end *****

// ***** binary *****
app.post("/upload-binary", (req, res) => {
	const ext = req.headers["x-ext"];
	console.log(ext);
	console.log("收到二进制上传请求");
	const fileName = `二进制方式上传_${Date.now()}.${ext}`;
	const filePath = `${uploadPath}${fileName}`;

	try {
		const chunks = [];
		req
			.on("data", (chunk) => {
				chunks.push(chunk);
			})
			.on("end", () => {
				const buffer = Buffer.concat(chunks);
				writeFileSync(filePath, buffer, "binary");
				console.log(`文件已保存: ${filePath}`);
				res.send("二进制方式：ok");
			});
	} catch (e) {
		console.error("二进制写入文件错误", e);
		res.status(500).send("服务器内部错误");
	}
});
// ***** binary end *****

// 启动服务器
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
