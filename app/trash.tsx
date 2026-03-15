import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Asset } from 'expo-media-library';
import { useTrashAlbum } from '../hooks/useTrashAlbum';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const ITEM_GAP = 3;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function TrashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trashAlbum = useTrashAlbum();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const items = await trashAlbum.getTrashAssets();
        setAssets(items);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRestore = useCallback(
    async (asset: Asset) => {
      await trashAlbum.removeFromTrash(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    },
    [trashAlbum],
  );

  const handleDeleteAll = useCallback(() => {
    if (assets.length === 0) return;

    Alert.alert(
      '전체 삭제',
      `${assets.length}장의 사진을 기기에서 완전히 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await trashAlbum.deleteAll();
              setAssets([]);
            } catch {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [assets, trashAlbum]);

  const handleRestoreAll = useCallback(() => {
    if (assets.length === 0) return;

    Alert.alert(
      '전체 복원',
      `${assets.length}장의 사진을 복원합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          onPress: async () => {
            await trashAlbum.restoreAll();
            setAssets([]);
          },
        },
      ],
    );
  }, [assets, trashAlbum]);

  const renderItem = useCallback(
    ({ item }: { item: Asset }) => {
      return (
        <Pressable
          style={styles.gridItem}
          onPress={() => handleRestore(item)}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnail}
          />
        </Pressable>
      );
    },
    [handleRestore],
  );

  const keyExtractor = useCallback(
    (item: Asset) => item.id,
    [],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>휴지통</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          휴지통 ({assets.length})
        </Text>
        <View style={styles.headerRight} />
      </View>

      {assets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>휴지통이 비어있어요</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={assets}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
          />

          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.base }]}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.deleteRed} />
            ) : (
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.actionButton, styles.restoreButton]}
                  onPress={handleRestoreAll}
                >
                  <Ionicons name="arrow-undo" size={18} color={colors.keepGreen} />
                  <Text style={[styles.actionButtonText, { color: colors.keepGreen }]}>
                    전체 복원
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteAll}
                >
                  <Ionicons name="trash" size={18} color={colors.deleteRed} />
                  <Text style={[styles.actionButtonText, { color: colors.deleteRed }]}>
                    전체 삭제
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingSm,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
  },
  emptyText: {
    ...typography.bodyLg,
    color: colors.textTertiary,
  },
  listContent: {
    paddingBottom: spacing.base,
  },
  row: {
    gap: ITEM_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: ITEM_GAP,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceDark,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  restoreButton: {
    backgroundColor: colors.surfaceDark,
  },
  deleteButton: {
    backgroundColor: colors.deleteRedBg,
  },
  actionButtonText: {
    ...typography.bodySm,
    fontFamily: 'Pretendard-SemiBold',
  },
});
