require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// THÊM ĐOẠN NÀY:
const importRoute = require('./routes/importRoute');

app.use(express.json()); // Để đọc JSON body nếu cần
app.use('/api/import', importRoute); // Định nghĩa prefix cho route import

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});