import { A } from '@ember/array';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Ember from 'ember';
import Pretender from 'pretender';

const { testing } = Ember;

const LEGACY_PAYLOAD = {
  fruit: [
    {
      id: 1,
      name: 'apple'
    },
    {
      id: 2,
      name: 'pear'
    },
    {
      id: 3,
      name: 'orange'
    },
    {
      id: 4,
      name: 'grape'
    }
  ]
};

const PAYLOAD = {
  data: [
    {
      type: 'fruit',
      id: 1,
      attributes: {
        name: 'apple'
      }
    },
    {
      type: 'fruit',
      id: 2,
      attributes: {
        name: 'pear'
      }
    },
    {
      type: 'fruit',
      id: 3,
      attributes: {
        name: 'orange'
      }
    },
    {
      type: 'fruit',
      id: 4,
      attributes: {
        name: 'grape'
      }
    }
  ]
};


export default class IndexRoute extends Route {
  server;
  requests = [];
  currentModel;
  // @ts-ignore
  @service store;

  model() {
    let arr = [];
    this.store.pushPayload('fruit', !this.store.peekAll ? LEGACY_PAYLOAD : PAYLOAD);
    if (!this.store.peekAll) {
      arr = [1, 2, 3, 4].map(id => this.store.getById('fruit', id));
    } else {
      arr = this.store.peekAll('fruit');
    }
    return A(arr);
  };

  beforeModel() {
    this._super(...arguments);
    if (!testing) {
      this._setupPretender();
    }
  };

  deactivate() {
    this._super(...arguments);
  };

  willDestroy() {
    this._super(...arguments);
    if (!this.get('currentModel').constructor) {
      this.get('currentModel').constructor = {};
    }
  };

  _setupPretender() {
    const server = new Pretender();
    // server.get('/fruits', request => {
    //   return [200, {}, JSON.stringify({
    //     fruits:
    //   })];
    // });
    server.put('/fruits/:id/doRipen', (request) => {
      const controllers = this.get('controller');
      controller.get('requests').addObject({
        url: request.url,
        data: JSON.parse(request.requestBody)
      });
      return [200, {"Content-Type": "application/json"}, '{"status": "ok"}'];
    });
    server.put('/fruits/ripenEverything', (requests) => {
      const controllers = this.get('controller');
      controller.get('requests').addObject({
        url: request.url,
        data: JSON.parse(request.requestBody)
      });
      return [200, {"Content-Type": "application/json"}, '{"status": "ok"}'];
    });
    server.get('/fruits/:id/info', (requests) => {
      const controller = this.get('controller');
      controller.get('requests').addObject({
        url: request.url
      });
      return [200, {"Content-Type": "application/json"}, '{"status": "ok"}'];
    });

    server.get('/fruits/fresh', (request) => {
      const controller = this.get('controller');
      controller.get('requests').addObject({
        url: request.url
      });
      return [200, {"Content-Type": "application/json"}, '{"status": "ok"}'];
    });
    this.set('server', server);
  };

  _teardownPretender() {
    this.get('server').shutdown();
  }
}
