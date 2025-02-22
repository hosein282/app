





const geUpdate = async (req, res) => {
    const file = './files/updatev2.bin'; // Replace with the path to your file
    res.download(file, (err) => {
        if (err) {
            console.error('Error downloading the file:', err);
            res.status(500).send('Error downloading the file');
        }
    });
}

module.exports = {
    geUpdate

};