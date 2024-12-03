const oFile = document.getElementById("file");
const oBtn = document.getElementById("upload-button");
oBtn.addEventListener(
	"click",
	function () {
		if (oFile.files.length === 0) {
			console.error("请先选择文件");
			return;
		}
		// ******** multipart/form-data ********
		// const formData = new FormData();
		// formData.append("file", oFile.files[0]);
		// fetch("http://localhost:8080/upload", {
		//   method: "POST",
		//   body: formData,
		// }).then(res => res.text()).then(res => {
		//   console.log(res);
		// });
		// ******** multipart/form-data end ********

		// ******** base64 ********
		// const reader = new FileReader();
		// reader.onload = (e) => {
		// 	try {
		// 		const uint8Array = new Uint8Array(e.target.result);
		// 		let base64File = "";
		// 		for (let i = 0; i < uint8Array.length; i++) {
		// 			base64File += String.fromCharCode(uint8Array[i]);
		// 		}
		// 		base64File = btoa(base64File);
		// 		const base64Data = {
		// 			base64File,
		// 			name: oFile.files[0].name,
		// 			type: oFile.files[0].type,
		// 			size: oFile.files[0].size,
		// 			lastModified: oFile.files[0].lastModified,
		// 		};
		// 		if (base64Data.size > 10 * 1024) {
		// 			console.log("文件超过10k，请重新选择");
		// 			return;
		// 		}
		// 		console.log("base64Data:", base64Data);
		// 		fetch("http://localhost:8080/upload-base64", {
		// 			method: "POST",
		// 			body: JSON.stringify(base64Data),
		// 			headers: {
		// 				"Content-Type": "application/json",
		// 			},
		// 		})
		// 			.then((res) => res.text())
		// 			.then((res) => {
		// 				console.log(res);
		// 			});
		// 	} catch (e) {
		// 		console.log("base64方式错误：", e);
		// 	}
		// };
		// reader.readAsArrayBuffer(oFile.files[0]);
		// ******** base64 end ********

		// ******** binary ********
		const reader = new FileReader();
		reader.readAsArrayBuffer(oFile.files[0]);
		reader.onloadend = function () {
			const arrayBuffer = reader.result;
			const blob = new Blob([arrayBuffer], { type: oFile.files[0].type });

			fetch("http://localhost:8080/upload-binary", {
				method: "POST",
				body: blob,
				headers: {
					"Content-Type": "application/octet-stream",
					"x-ext": oFile.files[0].name.split(".").pop(),
				},
			})
				.then((response) => response.text())
				.then((result) => {
					console.log("二进制上传结果:", result);
				})
				.catch((error) => {
					console.error("二进制上传错误:", error);
				});
		};
		// ******** binary end ********
	},
	false
);
