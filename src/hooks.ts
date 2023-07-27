import { useCallback, useContext, useEffect, useState } from 'react';
import { DocumentViewId } from 'shirokuma';

import { CacheContext } from './p2panda/contexts';
import {
  useCreate,
  useDocument,
  usePagination,
  usePanda,
} from './p2panda/hooks';
import {
  COMMENTS_SCHEMA_ID,
  EVENTS_SCHEMA_ID,
  MAX_DATE,
  MIN_DATE,
  PROFILES_SCHEMA_ID,
} from './constants';
import {
  countReactions,
  createProfile,
  createReaction,
  deleteProfile,
  deleteReaction,
  getAllEvents,
  getComments,
  getEvent,
  getProfile,
  getReactions,
  updateProfile,
} from './requests';

import type { Doc } from './p2panda/types';
import type { PaginationHook, DocumentHook } from './p2panda/hooks';
import type { Comment, Profile, Event } from './types';

// Event

export function useEvent(documentId: string): DocumentHook<Event> {
  const { client } = usePanda();

  const request = useCallback(async () => {
    const { event } = await getEvent(client, documentId);
    return event;
  }, [documentId, client]);

  return useDocument<Event>(EVENTS_SCHEMA_ID, documentId, request);
}

export function useEvents(
  from: string = MIN_DATE,
  to: string = MAX_DATE,
  search?: string,
): PaginationHook<Event> {
  const { client } = usePanda();

  const request = useCallback(
    async (endCursor: string) => {
      const { events } = await getAllEvents(
        client,
        from,
        to,
        search,
        endCursor,
      );
      return events;
    },
    [client, from, to, search],
  );

  return usePagination<Event>(EVENTS_SCHEMA_ID, request, [from, to, search]);
}

// Profile

export function useProfile(publicKey: string): {
  profile?: Profile;
  setProfile: (values: Profile) => void;
  isLoading: boolean;
} {
  const { client, session, publicKey: owner } = usePanda();
  const { cache, setCache } = useContext(CacheContext);
  const [document, setDocument] = useState<Doc<Profile> | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const update = useCallback(
    (values: Doc<Profile>) => {
      setDocument(values);

      setCache((cache) => ({
        ...cache,
        [PROFILES_SCHEMA_ID]: {
          ...cache[PROFILES_SCHEMA_ID],
          [publicKey]: values,
        },
      }));
    },
    [publicKey, setCache],
  );

  const clear = useCallback(() => {
    setDocument(undefined);

    setCache((cache) => {
      delete cache[PROFILES_SCHEMA_ID][publicKey];
      return cache;
    });
  }, [publicKey, setCache]);

  useEffect(() => {
    const fetchFromNode = async () => {
      setIsLoading(true);

      const { profiles } = await getProfile(client, publicKey);

      if (profiles.totalCount > 0) {
        update(profiles.documents[0]);
      } else {
        update({
          meta: {
            viewId: undefined,
            documentId: undefined,
            owner: publicKey,
          },
          fields: {
            username: '',
          },
        });
      }

      setIsLoading(false);
    };

    if (!publicKey) {
      return;
    }

    if (publicKey in cache[PROFILES_SCHEMA_ID]) {
      setDocument(cache[PROFILES_SCHEMA_ID][publicKey] as Doc<Profile>);
    } else {
      fetchFromNode();
    }
  }, [client, publicKey, update, cache]);

  const setProfile = useCallback(
    async (values: Profile) => {
      const { profiles } = await getProfile(client, publicKey);

      let document: Doc<Profile> | undefined;
      if (profiles.totalCount > 0) {
        document = profiles.documents[0];
      }

      if (!document && values.username) {
        const viewId = await createProfile(session, values);

        update({
          meta: {
            documentId: viewId as string,
            viewId,
            owner,
          },
          fields: values,
        });
      } else if (document && values.username) {
        const viewId = await updateProfile(
          session,
          values,
          document.meta.viewId,
        );

        update({
          ...document,
          meta: {
            ...document.meta,
            viewId,
          },
          fields: {
            ...document.fields,
            ...values,
          },
        });
      } else if (document && !values.username) {
        await deleteProfile(session, document.meta.viewId);
        clear();
      } else {
        return;
      }
    },
    [client, publicKey, owner, session, update, clear],
  );

  const profile = document ? document.fields : undefined;
  return { isLoading, profile, setProfile };
}

export function useUsername(publicKey: string): string {
  const { profile } = useProfile(publicKey);

  if (profile && profile.username.length > 0) {
    return profile.username;
  } else {
    return publicKey ? `#${publicKey.slice(0, 6)}` : '';
  }
}

// Reactions

export function useReactions(eventDocumentId: string): {
  reactions: number;
  myReaction: boolean;
  toggleReaction: () => void;
} {
  const { client, session, publicKey } = usePanda();
  const [reactions, setReactions] = useState(0);
  const [myReactions, setMyReactions] = useState<DocumentViewId[]>([]);

  useEffect(() => {
    const fetchFromNode = async () => {
      // Count all reactions
      const totalCount = await countReactions(client, eventDocumentId);
      setReactions(totalCount);

      // Get my reaction (if any)
      const result = await getReactions(client, eventDocumentId, publicKey);
      setMyReactions(
        result.reactions.documents.map((document) => {
          return document.meta.viewId;
        }),
      );
    };

    fetchFromNode();
  }, [client, eventDocumentId, publicKey]);

  const toggleReaction = useCallback(async () => {
    if (myReactions.length === 0) {
      setReactions((value) => value + 1);

      const viewId = await createReaction(session, {
        event: eventDocumentId,
      });

      setMyReactions((reactions) => [...reactions, viewId]);
    } else {
      setReactions((value) => value - myReactions.length);
      setMyReactions([]);

      for (const viewId of myReactions) {
        await deleteReaction(session, viewId);
      }
    }
  }, [session, eventDocumentId, myReactions]);

  return { reactions, toggleReaction, myReaction: myReactions.length > 0 };
}

// Comments

export function useComments(
  eventDocumentId: string,
): PaginationHook<Comment> & {
  createComment: (fields: Comment) => Promise<void>;
} {
  const { client } = usePanda();
  const { cache } = useContext(CacheContext);
  const create = useCreate<Comment>(COMMENTS_SCHEMA_ID);
  const [localDocuments, setLocalDocuments] = useState<DocumentViewId[]>([]);

  const request = useCallback(
    async (endCursor: string) => {
      const { comments } = await getComments(
        client,
        eventDocumentId,
        endCursor,
      );
      return comments;
    },
    [client, eventDocumentId],
  );

  const { documents: remoteDocuments, ...rest } = usePagination<Comment>(
    COMMENTS_SCHEMA_ID,
    request,
    [],
  );

  const createComment = useCallback(
    async (fields: Comment) => {
      const viewId = await create(fields);
      setLocalDocuments((list) => [...list, viewId]);
    },
    [create],
  );

  const documents = [
    ...localDocuments.map((viewId) => {
      return cache[COMMENTS_SCHEMA_ID][viewId as string] as Doc<Comment>;
    }),
    ...remoteDocuments,
  ];

  return {
    createComment,
    documents,
    ...rest,
  };
}
