const View = require('@keystonejs-contrib/view');
const bodyParser = require('body-parser');
const compatUtils = require('../v4-compat');

module.exports = (keystone, app) => {
  app.use('/test/view', bodyParser.urlencoded({ extended: true }), async (req, res) => {
    const locals = res.locals || {};
    const view = new View(keystone, req, res, { compatUtils });
    view
      .query(
        'q',
        `query {
      allPosts (where: { author: { id: "5c77a50a939aa93073dabe81"} }) {
        title
        author {
          email
          isAdmin
          password_is_set
          id
        }
        posted
        status
        id
      }
      Post(where: {id: "5c85803fac04940ab146f432"}) {
        id title status posted
      }
    }
    `
      )
      .then(result => {
        console.log('q-then: ', result);
      })
      .none(() => {
        console.log('q-none: ');
      })
      .err(err => {
        console.log('q-err: ', err);
      });

    view.on('post', { type: 'gql' }, async () => {
      // const queryFn = keystone._graphQLQuery['admin'];
      // const context = keystone.getAccessContext('admin', req);
      // locals.gql = await queryFn(req.body.query, context);
      locals.gqlQ = req.body.query;
      view.query('gql', req.body.query);
    });

    // view.query('r', 'Post', { where: { title: 'test' } }, 'author');
    // .then(result => {
    //   console.log('r-then: ', result);
    // })
    // .err(err => {
    //   console.log('r-err: ', err);
    // });
    view.on('render', async () => {
      // const context = keystone.getAccessContext('admin', req);
      // const postList = keystone.getListByKey('Post');
      // const query = { where: { [req.query.field || 'body']: req.query.data || '<p>test5</p>' } };
      // if(req.query.sort) {
      //   query.sort = req.query.sort;
      // }
      // locals.result = await postList.listQuery(query, context, 'allPosts');
    });

    view.render('____default');
  });

  app.use('/test/legacy', async (req, res) => {
    const locals = res.locals || {};
    const view = new View(keystone, req, res, { compatUtils });
    const User = compatUtils(keystone).list('User');
    view
      .query('q', User.model.find({ x: 't' }))
      .then(result => {
        console.log('q-then: ', result);
      })
      .err(err => {
        console.log('q-err: ', err);
      });

    // view.query('r', 'Post', { where: { title: 'test' } }, 'author');
    // .then(result => {
    //   console.log('r-then: ', result);
    // })
    // .err(err => {
    //   console.log('r-err: ', err);
    // });
    view.on('post', { type: 'legacy' }, async () => {
      locals.legacyQ = req.body.query;
      locals.legacy = await User.model.find(JSON.parse(req.body.query)).exec();
    });

    view.on('render', async () => {
      // const context = keystone.getAccessContext('admin', req);
      // const postList = keystone.getListByKey('Post');
      // const query = { where: { [req.query.field || 'body']: req.query.data || '<p>test5</p>' } };
      // if(req.query.sort) {
      //   query.sort = req.query.sort;
      // }
      locals.result = await User.model.findOne().exec();
    });

    view.render('____default');
  });
};
