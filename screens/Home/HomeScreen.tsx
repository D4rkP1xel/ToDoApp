import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import Octicons from "react-native-vector-icons/Octicons"
import FontAwesome from "react-native-vector-icons/FontAwesome5"
import Entypo from "react-native-vector-icons/Entypo"
import {
  useLocalCategories,
  useLocalTasks,
  useOfflineMode,
  useUserInfo,
} from "../../utils/zustandStateManager"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Feather from "react-native-vector-icons/Feather"
import axios from "../../utils/axiosConfig"
import getCustomDate, {
  getDatePrettyFormat,
  getTomorrow,
  getYesterday,
} from "../../utils/getCustomDate"
import { useQuery } from "react-query"
import Task from "../../utils/components/Task"
import { Calendar } from "react-native-calendars"
import useAppStyling from "../../utils/hooks/useAppStyling"
import CustomStatusBar from "../../utils/components/StatusBar"
import { getInternetStatus } from "../../utils/hooks/getInternetStatus"
import { task } from "../../utils/types"

type Nav = {
  navigate: (value: string, params: object | void) => void
  addListener: Function
}

function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [selectedDate, changeSelectedDate] = useState(getCustomDate(new Date()))
  const getOfflineMode = useOfflineMode((state) => state.isOfflineMode)
  const [shownMonthCalendar, setShownMonthCalendar] = useState(
    selectedDate.slice(0, 7)
  )
  const getLocalCategories = useLocalCategories((state) => state.categories)
  const { isOffline } = getInternetStatus()

  const [isMonthLoading, setIsMonthLoading] = useState(false)
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const userInfoState = useUserInfo((state) => state.userInfo)
  const getLocalTasksByDate = useLocalTasks(
    (state) => state.getLocalTasksWithDate
  )
  const getNumberLocalTasks = useLocalTasks(
    (state) => state.getNumberLocalTasks
  )
  const {
    mainColor,
    mainColorHash,
    bgColor,
    calendarBg,
    calendarDisabledDays,
    calendarEnabledDays,
  } = useAppStyling()
  const { data: calendarPerformance, refetch: refetchCalendarPerformance } =
    useQuery(["calendar_performance"], async () => {
      return getOfflineMode.offlineMode
        ? null
        : axios
            .post("/task/getMonthPerformance", {
              user_id: userInfoState.id,
              date: shownMonthCalendar,
            })
            .then((res) => {
              //console.log(res.data.data, shownMonthCalendar)
              return res.data.data
            })
            .catch((err) => {
              console.log(err)
            })
    })
  const { data: categories } = useQuery(["categories"], async () => {
    //do not delete, its used in add/edit task
    return getOfflineMode.offlineMode
      ? getLocalCategories.categories
      : axios
          .post("/category/get", { user_id: userInfoState.id })
          .then((res) => {
            //console.log(res.data.categories)
            return res.data.categories
          })
          .catch((err) => {
            console.log(err)
          })
  })

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useQuery(["tasks", selectedDate], async () => {
    return getOfflineMode.offlineMode
      ? getLocalTasksByDate(userInfoState.id, selectedDate)
      : await axios
          .post("/task/get", {
            user_id: userInfoState.id,
            date: selectedDate,
          })
          .then((res) => {
            //console.log(res.data.tasks)
            return res.data.tasks
          })
          .catch((err) => {
            console.log(err)
          })
  })
  useEffect(() => {
    //console.log("request")
    refetchTasks()
    refetchCalendarPerformance()
  }, [getOfflineMode.offlineMode])
  useEffect(() => {
    async function refetchMonth() {
      setIsMonthLoading(true)
      await refetchCalendarPerformance()
      setIsMonthLoading(false)
    }
    refetchMonth()
  }, [shownMonthCalendar])

  return (
    <>
      <Modal transparent={true} visible={isCalendarOpen}>
        <TouchableWithoutFeedback
          className="h-screen w-screen"
          onPress={() => setCalendarOpen(false)}>
          <View
            className="h-screen w-screen"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
            }}>
            <View className="mt-32 relative">
              {isMonthLoading && !getOfflineMode.offlineMode ? (
                <ActivityIndicator
                  size={"large"}
                  className="absolute z-50 w-full -top-14 left-auto right-auto"
                />
              ) : null}
              <Calendar
                disableAllTouchEventsForDisabledDays={true}
                theme={{
                  calendarBackground: calendarBg,
                  monthTextColor: mainColorHash,
                  textDisabledColor: calendarDisabledDays,
                  dayTextColor: calendarEnabledDays,
                }}
                minDate={getCustomDate(new Date(userInfoState.creation_date))}
                initialDate={selectedDate}
                maxDate={getCustomDate(getTomorrow())}
                onDayPress={(date) => {
                  changeSelectedDate(date.dateString)
                  setCalendarOpen(false)
                }}
                onMonthChange={(date) => {
                  setShownMonthCalendar(
                    `${date.year}-${date.month.toString().padStart(2, "0")}`
                  )
                }}
                markedDates={
                  calendarPerformance != null ? calendarPerformance : null
                }
                hideExtraDays={true}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss()
        }}
        accessible={false}>
        <SafeAreaView className={`${bgColor} h-screen`}>
          <CustomStatusBar />

          {isOffline ? (
            <View className="absolute top-20 right-10">
              <Feather name={"wifi-off"} color={"red"} size={26} />
            </View>
          ) : null}
          <View className="pt-6 px-8 pb-6 ">
            <View className="flex-row w-full">
              <Text className={`text-2xl ${mainColor}`}>
                {selectedDate === getCustomDate(new Date())
                  ? "Today"
                  : selectedDate === getYesterday()
                  ? "Yesterday"
                  : selectedDate === getCustomDate(getTomorrow())
                  ? "Tomorrow"
                  : getDatePrettyFormat(selectedDate)}
              </Text>
              <View className="h-fit ml-auto">
                <View className="flex-row gap-6 items-center">
                  <MaterialIcons
                    name={"settings"}
                    color={mainColorHash}
                    size={26}
                    onPress={() => navigation.navigate("Settings")}
                  />
                  <Entypo
                    name={"line-graph"}
                    color={mainColorHash}
                    size={26}
                    onPress={() => {
                      if (getOfflineMode.offlineMode) {
                        //offline mode is on
                        return Alert.alert(
                          "Access denied.",
                          "Turn off offline mode to have access to Your Performance."
                        )
                      }
                      navigation.navigate("Performance")
                    }}
                  />
                  <FontAwesome
                    name={"calendar"}
                    color={mainColorHash}
                    size={26}
                    onPress={() => {
                      setCalendarOpen(true)
                    }}
                  />

                  <Octicons
                    onPress={() =>
                      getOfflineMode.offlineMode &&
                      getNumberLocalTasks(userInfoState.id) >= 250
                        ? Alert.alert(
                            "Access denied",
                            "You have reached the limit amount of offline tasks you can add without uploading them. If you wish to add more, either delete tasks or upload them."
                          )
                        : navigation.navigate("AddTask", {
                            selectedDate: selectedDate,
                          })
                    }
                    name={"plus"}
                    color={mainColorHash}
                    size={26}
                  />
                </View>
              </View>
            </View>
          </View>

          <ScrollView>
            <View className="mt-4 mb-24 px-8">
              {tasks != null && Array.isArray(tasks) && tasks.length > 0 ? (
                tasks.map((task: task) => {
                  return (
                    <Task
                      name={task.name}
                      is_done={task.is_done}
                      id={task.id}
                      category={task.task_category_name}
                      selectedDate={selectedDate}
                      taskTime={task.task_time}
                      key={task.id}></Task>
                  )
                })
              ) : isLoadingTasks ? (
                <ActivityIndicator size={"large"} />
              ) : (
                <Text className={`${mainColor}`}>
                  No tasks added for this day
                </Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

export default HomeScreen
