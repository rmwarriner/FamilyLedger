use sodiumoxide::crypto::scalarmult::curve25519::{self, Scalar};

pub struct SyncKeyPair {
    pub private: [u8; 32],
    pub public: [u8; 32],
}

pub fn generate_sync_key_pair() -> Option<SyncKeyPair> {
    if sodiumoxide::init().is_err() {
        return None;
    }
    let scalar = curve25519::Scalar::from_slice(&sodiumoxide::randombytes::randombytes(32))?;
    let group = curve25519::scalarmult_base(&scalar);
    Some(SyncKeyPair {
        private: scalar.0,
        public: group.0,
    })
}

pub fn derive_sync_shared_secret(private_key: [u8; 32], peer_public_key: [u8; 32]) -> Option<[u8; 32]> {
    if sodiumoxide::init().is_err() {
        return None;
    }
    let private = Scalar(private_key);
    let peer_public = curve25519::GroupElement(peer_public_key);
    curve25519::scalarmult(&private, &peer_public).ok().map(|g| g.0)
}

#[cfg(test)]
mod tests {
    use super::{derive_sync_shared_secret, generate_sync_key_pair};

    #[test]
    fn x25519_shared_secret_matches_between_peers() {
        let a = generate_sync_key_pair().expect("keypair a");
        let b = generate_sync_key_pair().expect("keypair b");
        let a_secret = derive_sync_shared_secret(a.private, b.public).expect("a secret");
        let b_secret = derive_sync_shared_secret(b.private, a.public).expect("b secret");
        assert_eq!(a_secret, b_secret);
    }

    #[test]
    fn shared_secret_changes_for_different_peer() {
        let a = generate_sync_key_pair().expect("keypair a");
        let b = generate_sync_key_pair().expect("keypair b");
        let c = generate_sync_key_pair().expect("keypair c");
        let with_b = derive_sync_shared_secret(a.private, b.public).expect("with b");
        let with_c = derive_sync_shared_secret(a.private, c.public).expect("with c");
        assert_ne!(with_b, with_c);
    }
}
