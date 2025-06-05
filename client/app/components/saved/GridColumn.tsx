import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SavedCard from './SavedCard'; // Adjust the path if needed

interface GridColumnProps {
  totalSites: number;
  isClicked: any;
  setIsClicked: any;
}

const GridColumn: React.FC<GridColumnProps> = ({ totalSites, isClicked, setIsClicked }) => {
  const colNum = 3;
  const rowNum = Math.ceil(totalSites / colNum);

  const screenWidth = Dimensions.get('window').width;
  const colWidth = screenWidth / colNum;

  return (
    <>
      {Array.from({ length: rowNum }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {Array.from({ length: colNum }).map((_, colIndex) => {
            const siteIndex = rowIndex * colNum + colIndex;
            if (siteIndex >= totalSites) return null;

            return (
              <View key={siteIndex} style={[styles.col, { width: colWidth }]}>
                <SavedCard
                  postId={siteIndex}
                  isClicked={isClicked}
                  setIsClicked={setIsClicked}
                />
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  col: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GridColumn;
