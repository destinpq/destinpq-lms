// Mock storage type
interface MockStorage {
  ref: (path: string) => {
    put: (file: File) => {
      on: (event: string, 
          onProgress: (snapshot: {bytesTransferred: number, totalBytes: number}) => void, 
          onError: (error: Error) => void, 
          onComplete: () => void) => () => void;
      then: (onResolve: (result: {ref: {getDownloadURL: () => Promise<string>}}) => void) => {catch: () => void};
    };
    delete: () => Promise<void>;
    getDownloadURL: () => Promise<string>;
  };
}

// Mock document data type
interface MockDocData {
  exists: boolean;
  data: () => any | null;
  id: string;
}

// Mock Storage implementation
const mockStorage: MockStorage = {
  ref: (path: string) => ({
    put: (file: File) => ({
      on: (event: string, 
          onProgress: (snapshot: {bytesTransferred: number, totalBytes: number}) => void, 
          onError: (error: Error) => void, 
          onComplete: () => void) => {
        // Simulate upload progress
        setTimeout(() => onProgress({ bytesTransferred: file.size / 2, totalBytes: file.size }), 500);
        setTimeout(() => onProgress({ bytesTransferred: file.size, totalBytes: file.size }), 1000);
        setTimeout(() => onComplete(), 1200);
        
        // Return unsubscribe function
        return () => {};
      },
      then: (onResolve) => {
        setTimeout(() => onResolve({ 
          ref: {
            getDownloadURL: () => Promise.resolve(`https://mockurl.com/${path}/${Date.now()}`)
          }
        }), 1000);
        return { catch: () => {} };
      }
    }),
    delete: () => Promise.resolve(),
    getDownloadURL: () => Promise.resolve(`https://mockurl.com/${path}/${Date.now()}`),
  })
};

// Create a complete mock implementation of Firestore
const mockFirestore = {
  collection: (_collectionPath: string) => ({
    doc: (docPath: string) => ({
      get: () => Promise.resolve<MockDocData>({ 
        exists: false, 
        data: () => null,
        id: docPath
      }),
      set: (_data: any) => Promise.resolve(),
      update: (_data: any) => Promise.resolve(),
      delete: () => Promise.resolve(),
      onSnapshot: (_callback: any) => {
        // Return unsubscribe function
        return () => {};
      }
    }),
    add: (data: any) => Promise.resolve({ id: `mock-${Math.random().toString(36).substring(2, 9)}` }),
    get: () => Promise.resolve({
      empty: true,
      docs: [],
      forEach: (_callback: any) => {},
      size: 0
    }),
    where: () => ({
      get: () => Promise.resolve({
        empty: true,
        docs: [],
        forEach: (_callback: any) => {},
        size: 0
      }),
      orderBy: () => ({
        get: () => Promise.resolve({
          empty: true,
          docs: [],
          forEach: (_callback: any) => {},
          size: 0
        }),
        limit: () => ({
          get: () => Promise.resolve({
            empty: true,
            docs: [],
            forEach: (_callback: any) => {},
            size: 0
          })
        })
      }),
      where: () => ({
        get: () => Promise.resolve({
          empty: true,
          docs: [],
          forEach: (_callback: any) => {},
          size: 0
        })
      })
    }),
    orderBy: () => ({
      get: () => Promise.resolve({
        empty: true,
        docs: [],
        forEach: (_callback: any) => {},
        size: 0
      }),
      limit: () => ({
        get: () => Promise.resolve({
          empty: true,
          docs: [],
          forEach: (_callback: any) => {},
          size: 0
        })
      })
    }),
    onSnapshot: (callback: any) => {
      // Immediately call with empty results
      callback({
        empty: true,
        docs: [],
        forEach: (_cb: any) => {},
        size: 0
      });
      // Return unsubscribe function
      return () => {};
    }
  }),
  doc: (path: string) => ({
    get: () => Promise.resolve<MockDocData>({ 
      exists: false, 
      data: () => null,
      id: path.split('/').pop() || ''
    }),
    set: (_data: any) => Promise.resolve(),
    update: (_data: any) => Promise.resolve(),
    delete: () => Promise.resolve(),
    onSnapshot: (_callback: any) => {
      // Return unsubscribe function
      return () => {};
    }
  }),
  batch: () => ({
    set: () => ({}),
    update: () => ({}),
    delete: () => ({}),
    commit: () => Promise.resolve()
  }),
  runTransaction: (callback: any) => Promise.resolve(callback({ 
    get: () => Promise.resolve({ exists: false, data: () => null }) 
  })),
  enableNetwork: () => Promise.resolve(),
  disableNetwork: () => Promise.resolve(),
};

// Export mock services 
const db = mockFirestore;
const storage = mockStorage;

// Export a warning about using mock implementations
console.warn('⚠️ IMPORTANT: Using local mock implementations instead of Firebase');

export { db, storage }; 