import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"
import Fontisto from "react-native-vector-icons/Fontisto"
import { useMutation, useQueryClient } from "react-query"
import { Retryer } from "react-query/types/core/retryer"
import axios from "../utils/axiosConfig"

interface props {
  setEditMenuOpen: any
  initialTaskName: string
  id: string
  is_done: number
}

interface task {
  id: string
  name: string
  date: string | number
  user_id: string
  is_done: number
}

function EditTaskMenu({
  setEditMenuOpen,
  initialTaskName,
  id,
  is_done,
}: props) {
  const [taskName, setTaskName] = useState(initialTaskName)
  const [is_done_state, set_is_done_state] = useState(is_done)
  const queryClient = useQueryClient()
  const tasks: task[] | undefined = queryClient.getQueryData(["tasks"])

  const { mutate: mutateSaveChanges } = useMutation(
    async (params: [taskNameAux: string, is_done_aux: number]) =>
      await saveTask(...params),
    {
      onMutate: (params: [taskNameAux: string, is_done_aux: number]) => {
        if (initialTaskName.trim() !== params[0].trim()) {
          //change task name
          if (params[0].trim().length < 2) return
          if (
            tasks != null &&
            tasks
              .filter((task: task) => task.id !== id)
              .map((task: task) => task.name.toLowerCase())
              .includes(params[0].trim().toLowerCase())
          )
            return

          queryClient.cancelQueries({ queryKey: ["tasks"] })
          queryClient.setQueryData(
            ["tasks"],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].name = params[0]
                  break
                }
              }
              return prev
            }
          )
        }
        if (is_done !== params[1]) {
          queryClient.cancelQueries({ queryKey: ["tasks"] })
          queryClient.setQueryData(
            ["tasks"],
            (prev: task[] | undefined | void) => {
              if (prev == null) return

              for (let index = 0; index < prev.length; index++) {
                let task = prev[index]
                if (task.id === id) {
                  prev[index].is_done = params[1]
                  break
                }
              }
              return prev
            }
          )
        }
      },
    }
  )

  const { mutate: mutateDeleteTask } = useMutation(
    async (task_id: string) => await deleteTask(task_id),
    {
      onMutate: (task_id: string) => {
        setEditMenuOpen("")
        queryClient.cancelQueries({ queryKey: ["tasks"] })
        queryClient.setQueryData(
          ["tasks"],
          (prev: task[] | undefined | void) => {
            if (prev == null) return

            for (let index = 0; index < prev.length; index++) {
              let task = prev[index]
              if (task.id === task_id) {
                prev.splice(index, 1)
                break
              }
            }
            return prev
          }
        )
      },
    }
  )
  async function saveTask(taskNameAux: string, is_done_aux: number) {
    if (initialTaskName.trim() !== taskNameAux.trim()) {
      //change task name
      if (taskNameAux.trim().length < 2)
        return Alert.alert("Minimum task name size is 2 letters.")
      if (
        tasks != null &&
        tasks
          .filter((task: task) => task.id !== id)
          .map((task: task) => task.name.toLowerCase())
          .includes(taskNameAux.trim().toLowerCase())
      )
        return Alert.alert("Task name already exists")
      try {
        await axios.post("/task/changename", {
          task_id: id,
          task_name: taskNameAux.trim(),
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
        return
      }
    }
    if (is_done !== is_done_aux) {
      try {
        await axios.post("/task/changedone", {
          task_id: id,
          is_done: is_done_aux,
        })
      } catch (err) {
        console.log(err)
        setEditMenuOpen("")
      }
    }
    setEditMenuOpen("")
  }

  async function deleteTask(idParam: string) {
    try {
      await axios.post("/task/remove", {
        task_id: idParam,
      })
    } catch (err) {
      console.log(err)
      setEditMenuOpen("")
      return
    }
  }

  return (
    <View className="h-screen w-screen fixed">
      <View className="mt-12 px-8 h-full pb-14">
        <View className="flex-row w-full">
          <View className="h-fit ml-auto">
            <AntDesign
              name={"close"}
              color={"black"}
              size={32}
              onPress={() => setEditMenuOpen("")}
            />
          </View>
        </View>
        <View className="flex-row gap-8 items-center">
          <Text className="font-semibold text-2xl">Task:</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => mutateDeleteTask(id)}
            className="w-2/12 rounded-full h-6 bg-red-500 justify-center items-center"
            style={{ elevation: 2 }}>
            <Text className="text-white">Delete</Text>
          </TouchableOpacity>
        </View>

        <View className="border-b w-10/12 mt-4">
          <TextInput
            className="text-base"
            multiline={false}
            value={taskName}
            onChangeText={(text) => setTaskName(text)}></TextInput>
        </View>

        <Text className="font-semibold text-2xl mt-8">Status:</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => set_is_done_state(-1)}
          className="py-2 px-4 border-2 border-red-600 rounded-lg mt-6 bg-gray-50 flex-row items-center justify-between"
          style={{ elevation: 2 }}>
          <Text className="text-base font-medium">Not done</Text>
          {is_done_state === -1 ? (
            <Fontisto name="radio-btn-active" color={"black"} size={20} />
          ) : (
            <Fontisto name="radio-btn-passive" color={"black"} size={20} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => set_is_done_state(0)}
          className="py-2 px-4 border-2 border-orange-500 rounded-lg mt-4 bg-gray-50 flex-row items-center justify-between"
          style={{ elevation: 2 }}>
          <Text className="text-base font-medium">
            Currently doing / halfway done
          </Text>
          {is_done_state === 0 ? (
            <Fontisto name="radio-btn-active" color={"black"} size={20} />
          ) : (
            <Fontisto name="radio-btn-passive" color={"black"} size={20} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => set_is_done_state(1)}
          className="py-2 px-4 border-2 border-green-600 rounded-lg mt-4 bg-gray-50 flex-row items-center justify-between"
          style={{ elevation: 2 }}>
          <Text className="text-base font-medium">Completed</Text>
          {is_done_state === 1 ? (
            <Fontisto name="radio-btn-active" color={"black"} size={20} />
          ) : (
            <Fontisto name="radio-btn-passive" color={"black"} size={20} />
          )}
        </TouchableOpacity>
        <View className="mt-auto w-full flex-row-reverse">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => mutateSaveChanges([taskName, is_done_state])}
            className="w-4/12 rounded-full h-12 bg-blue-500 justify-center items-center mb-3"
            style={{ elevation: 2 }}>
            <Text className="text-white text-lg">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default EditTaskMenu