const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
app.use(express.json());
const port = 3000;

const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

var blogData=0;


app.get('/api/blog-stats', async (req, res) => {
  try {
    const response = await axios.get(apiUrl, {
      headers: { 'x-hasura-admin-secret': adminSecret },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch data from the API');
    }

    blogData = response.data.blogs;

    
    // Check if the API response is an array
    if (!Array.isArray(blogData)) {
      throw new Error('API response is not an array');
    }

    const totalBlogs = blogData.length;

    const blogWithLongestTitle = _.maxBy(blogData, (blog) => (blog.title ? blog.title.length : 0));

    const blogsWithPrivacyKeyword = _.filter(blogData, (blog) =>
      _.includes(_.toLower(blog.title), 'privacy')
    ).length;

    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    res.json({
      totalBlogs,
      longestTitle: blogWithLongestTitle? blogWithLongestTitle.title : 'N/A',
      blogsWithPrivacyKeyword,
      uniqueBlogTitles,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred while fetching and analyzing blog data.' });
  }
});

app.get('/api/blog-search', (req, res) => {
    try {
      const query = req.query.query.toLowerCase();
      
      // Filter blogs based on the query string (case-insensitive)
      const filteredBlogs = blogData.filter((blog) => {
        return _.toLower(blog.title).includes(query);
      });
  
      res.json({ results: filteredBlogs });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'An error occurred during blog search.' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
