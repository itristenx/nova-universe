import SwiftUI

struct ContentView: View {
    @ObservedObject var model: LauncherModel
    @State private var selected: Set<String> = ["api"]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            ForEach(Array(model.envs.keys), id: .self) { key in
                Toggle(key, isOn: Binding(
                    get: { selected.contains(key) },
                    set: { if $0 { selected.insert(key) } else { selected.remove(key) } }
                ))
            }
            HStack {
                Button("Start") { model.start(selected: Array(selected)) }
                Button("Admin UI") { model.openAdmin() }
            }
        }
        .padding(Theme.Spacing.md)
        .frame(width: 400, height: 300)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(model: LauncherModel())
    }
}
