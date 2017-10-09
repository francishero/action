/**
 * When a user joins a team, we need to put them on that team.
 * This includes storing the team in their JWT
 */
import {sign} from 'jsonwebtoken';
import {clientSecret} from './auth0Helpers';
import {JWT_LIFESPAN} from './serverConstants';
import {toEpochSeconds} from 'server/utils/epochTime';
import makeAppLink from 'server/utils/makeAppLink';
import {clientId} from 'server/utils/auth0Helpers';

export default function tmsSignToken(authToken = {}, tms) {
  if (!authToken.sub) {
    throw new Error('Auth token is missing sub');
  }
  // new token will expire in 30 days
  // JWT timestamps chop off milliseconds
  const now = Date.now();
  const exp = toEpochSeconds(now + JWT_LIFESPAN);
  const iat = toEpochSeconds(now);
  const newToken = {
    ...authToken,
    aud: clientId,
    iss: makeAppLink(),
    exp,
    iat,
    tms
  };
  // auth0 signs their tokens with a base64 buffer, so we should too, otherwise the socket will get confused
  const secret = new Buffer(clientSecret, 'base64');
  return sign(newToken, secret);
}
