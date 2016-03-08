__author__ = 'anand'

import logging
import redis
import json
import config
import traceback
from .dbinterface import DbInterface


class RedisDbClient(DbInterface):
    redis_client = redis.from_url(config.REDIS_URL)

    def __init__(self):
        self.logger = logging.getLogger('web')

    def exe_(self, func, *value):
        try:
            ret=func(*value)
            return ret
        except:
            traceback.print_exc()
            return None

    def hset(self, key, value):
        return self.exe_(self.redis_client.hset, key, value)

    def hgetall(self, key):
        return self.exe_(self.redis_client.hgetall, key, value)
        # return self.redis_client.hgetall(key)

    def lrem(self, key, count, value):
        return self.exe_(self.execute_command,'lrem',key, count, value)
        # return self.redis_client.execute_command('lrem',key, count, value)

    def rpush(self, key, value):
        return self.exe_(self.redis_client.rpush, key, *value)
        # return self.redis_client.rpush(key, *value)

    def lrange(self, key, start, end):
        value = self.exe_(self.redis_client.lrange, key, start, end)
        # value=self.redis_client.lrange(key, start, end)
        if value:
            return [json.loads(v.decode('utf-8')) for v in value]
        return []

    def delete(self, key):
        self.exe_(self.redis_client.delete, key)
        # self.redis_client.delete(key)
