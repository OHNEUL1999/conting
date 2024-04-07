import * as React from 'react';
import {useRef, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {YellowButton} from './Button';
import {widthPercent} from '../../config/Dimensions';
import ConcertDateChoiceButton from './ConcertDateChoiceButton';
import FamilySelectButton from './FamilySelectButton';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function ConcertBottomButtons({scrollY, schedule, showID, showButtons,setShowButtons}) {
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(()=> {
    if (showDateSelector || showRequest) {
        if (showButtons === true){
        console.log('터치함')
        // 배경 터치한 경우, 함수 호출
        handleOutsidePress();

      }
    }
  })

  // 버튼의 불투명도 제어를 위한 Animated.Value
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  // 날짜 선택기의 Y위치 제어를 위한 Animated.Value
  const dateSelectorY = useRef(new Animated.Value(100)).current;

  // 버튼의 translateY 값을 애니메이션화
  const translateY = scrollY.interpolate({
    inputRange: [0, 50], // 스크롤이 0에서 50 사이일 때
    outputRange: [0, 100], // 버튼이 0에서 100 사이로 내려감
    extrapolate: 'clamp', // 'clamp'는 outputRange를 벗어나지 않도록 함
  });

  // 직접 예매하기 버튼 누른 경우 호출될 함수
  const onDirectTicketingPress = () => {
    // console.log('dd', scrollY);
    // console.log('ㅇ?', schedule);
    // 기존 버튼을 숨기는 애니메이션
    Animated.timing(buttonOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDateSelector(true); // 날짜 선택기 표시
      // 날짜 선택기가 올라오는 애니메이션
      Animated.timing(dateSelectorY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // 예매 부탁하기 버튼 클릭 시 호출될 함수
  const onRequestPress = () => {
    // 기존 버튼을 숨기는 애니메이션
    Animated.timing(buttonOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowRequest(true);

      Animated.timing(dateSelectorY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // 사용자가 확장된 UI 외부를 터치했을 때 호출될 함수
 const handleOutsidePress = () => {
  // 만약 가족 선택 또는 날짜 선택 버튼이 렌더링 되있는 경우, 닫기
  
    setShowDateSelector(false);
    setShowRequest(false);
    // 버튼을 다시 보이게 하는 애니메이션 추가
    Animated.timing(buttonOpacity, {
      toValue: 1, // 불투명도를 1로 설정
      duration: 300, // 애니메이션 지속 시간
      useNativeDriver: true,
    }).start();
    setShowButtons(false);
  
};


  return (
    
    <View style={styles.container}>
      <Animated.View
        style={[{opacity: buttonOpacity}, {transform: [{translateY}]}]}>
        <LinearGradient
          style={styles.background}
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} // 시작과 끝에서 투명도 변화
        >
          <View style={styles.buttonGroup}>
            <YellowButton
              onPress={onRequestPress}
              width={widthPercent(160)}
              btnText="예매 부탁하기"
              textSize={16}
              isRadius
            />
            <YellowButton
              onPress={onDirectTicketingPress}
              width={widthPercent(160)}
              btnText="직접 예매하기"
              textSize={16}
              isRadius
            />
          </View>
        </LinearGradient>
      </Animated.View>
      {showRequest && (
        <Animated.View style={{transform: [{translateY: dateSelectorY}]}}>
          <FamilySelectButton showID={showID} />
        </Animated.View>
      )}
      {showDateSelector && (
        <Animated.View style={{transform: [{translateY: dateSelectorY}]}}>
          <ConcertDateChoiceButton schedule={schedule} showID={showID} />
        </Animated.View>
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  background: {
    width: '100%',
    alignItems: 'center',
  },

  buttonGroup: {
    marginVertical: widthPercent(12),
    flexDirection: 'row',
  },
});
