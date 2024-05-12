import { GraphQLClient, gql } from 'graphql-request';
import { DocumentViewId, OperationFields, Session } from 'shirokuma';

import { request } from './p2panda/graphql';
import {
  COMMENTS_SCHEMA_ID,
  EVENTS_SCHEMA_ID,
  MAX_DATE,
  MIN_DATE,
  PROFILES_SCHEMA_ID,
  REACTIONS_SCHEMA_ID,
} from './constants';

import type { Doc, Paginated } from './p2panda/types';
import type { Comment, Event, Profile, Reaction } from './types';
import { DateTime } from 'luxon';

const DEFAULT_PAGE_SIZE = 10;

// Events

export async function createEvent(
  session: Session,
  event: Event,
): Promise<DocumentViewId> {
  return await session.create(event, {
    schemaId: EVENTS_SCHEMA_ID,
  });
}

export async function getEvent(
  client: GraphQLClient,
  documentId: string,
): Promise<{ event: Doc<Event> }> {
  const query = gql`{
    event: ${EVENTS_SCHEMA_ID}(id: "${documentId}") {
      meta {
        owner
        documentId
        viewId
      }
      fields {
        title
        location
        description
        happening_at
        created_at
      }
    }
  }`;

  return await request(client, query);
}

export async function getAllEvents(
  client: GraphQLClient,
  from: string = MIN_DATE,
  to: string = MAX_DATE,
  search?: string,
  after?: string,
  first: number = DEFAULT_PAGE_SIZE,
): Promise<{
  events: Paginated<Event>;
}> {
  const fromTimestamp = DateTime.fromFormat(from, 'yyyy-MM-dd').toSeconds();
  const toTimestamp = DateTime.fromFormat(to, 'yyyy-MM-dd')
    .endOf('day')
    .toSeconds();

  const query = gql`{
    events: all_${EVENTS_SCHEMA_ID}(
      first: ${first}
      ${after ? `after: "${after}"` : ''}
      orderBy: "happening_at"
      orderDirection: ASC
      filter: {
        ${search ? `title: { contains: "${search}" }` : ''}
        happening_at: { gte: ${fromTimestamp}, lte: ${toTimestamp} }
      }
    ) {
      totalCount
      endCursor
      hasNextPage
      documents {
        meta {
          owner
          documentId
          viewId
        }
        fields {
          title
          location
          description
          happening_at
          created_at
        }
      }
    }
  }`;

  return await request(client, query);
}

export async function updateEvent(
  session: Session,
  event: Partial<Event>,
  viewId: DocumentViewId,
): Promise<DocumentViewId> {
  return await session.update(event, viewId, {
    schemaId: EVENTS_SCHEMA_ID,
  });
}

export async function deleteEvent(
  session: Session,
  viewId: DocumentViewId,
): Promise<DocumentViewId> {
  return await session.delete(viewId, {
    schemaId: EVENTS_SCHEMA_ID,
  });
}

// Profiles

export async function createProfile(
  session: Session,
  profile: Profile,
): Promise<DocumentViewId> {
  return await session.create(profile, {
    schemaId: PROFILES_SCHEMA_ID,
  });
}

export async function getProfile(
  client: GraphQLClient,
  publicKey: string,
): Promise<{
  profiles: Paginated<Profile>;
}> {
  const query = gql`{
    profiles: all_${PROFILES_SCHEMA_ID}(
      first: 1
      meta: {
        owner: { eq: "${publicKey}" }
      }
    ) {
      totalCount
      hasNextPage
      endCursor
      documents {
        meta {
          documentId
          viewId
          owner
        }
        fields {
          username
        }
      }
    }
  }`;

  return await request(client, query);
}

export async function updateProfile(
  session: Session,
  profile: Partial<Profile>,
  viewId: DocumentViewId,
): Promise<DocumentViewId> {
  return await session.update(profile, viewId, {
    schemaId: PROFILES_SCHEMA_ID,
  });
}

export async function deleteProfile(
  session: Session,
  viewId: DocumentViewId,
): Promise<DocumentViewId> {
  return await session.delete(viewId, {
    schemaId: PROFILES_SCHEMA_ID,
  });
}

// Reactions

export async function createReaction(
  session: Session,
  reaction: Reaction,
): Promise<DocumentViewId> {
  const fields = new OperationFields();
  fields.insert('event', 'relation', reaction.event);

  return await session.create(fields, {
    schemaId: REACTIONS_SCHEMA_ID,
  });
}

export async function countReactions(
  client: GraphQLClient,
  eventDocumentId: string,
): Promise<number> {
  const query = gql`{
    reactions: all_${REACTIONS_SCHEMA_ID}(
      filter: { event: { eq: "${eventDocumentId}" } }
    ) {
      totalCount
    }
  }`;

  const { reactions } = await request<{
    reactions: { totalCount: number };
  }>(client, query);

  return reactions.totalCount;
}

export async function getReactions(
  client: GraphQLClient,
  eventDocumentId: string,
  publicKey: string,
): Promise<{ reactions: Paginated<Record<string, never>> }> {
  const query = gql`{
    reactions: all_${REACTIONS_SCHEMA_ID}(
      meta: { owner: { eq: "${publicKey}" } }
      filter: { event: { eq: "${eventDocumentId}" } }
    ) {
      endCursor
      totalCount
      hasNextPage
      documents {
        meta {
          documentId
          viewId
          owner
        }
      }
    }
  }`;

  return await request(client, query);
}

export async function deleteReaction(
  session: Session,
  viewId: DocumentViewId,
): Promise<DocumentViewId> {
  return await session.delete(viewId, {
    schemaId: REACTIONS_SCHEMA_ID,
  });
}

// Comments

export async function createComment(
  session: Session,
  { text, created_at, event }: Comment,
): Promise<DocumentViewId> {
  const fields = new OperationFields({
    text,
    created_at,
  });
  fields.insert('event', 'relation', event);

  return await session.create(fields, {
    schemaId: COMMENTS_SCHEMA_ID,
  });
}

export async function getComments(
  client: GraphQLClient,
  eventDocumentId: string,
  after?: string,
  first: number = DEFAULT_PAGE_SIZE,
): Promise<{
  comments: Paginated<Comment>;
}> {
  const query = gql`{
    comments: all_${COMMENTS_SCHEMA_ID}(
      first: ${first}
      ${after ? `after: "${after}"` : ''}
      orderBy: "created_at"
      orderDirection: DESC
      filter: { event: { eq: "${eventDocumentId}" } }
    ) {
      totalCount
      hasNextPage
      endCursor
      documents {
        meta {
          documentId
          viewId
          owner
        }
        fields {
          text
          created_at
        }
      }
    }
  }`;

  return await request(client, query);
}
